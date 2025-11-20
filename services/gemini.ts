import { GoogleGenAI, Chat, GenerateContentResponse, Content } from "@google/genai";
import { Message, Sender } from "../types";
import { storageUtils } from "../src/utils/storage.ts";

// API client instance
let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

// Initialize API client with API key
export const initializeApiClient = (apiKey: string): void => {
  if (!apiKey) {
    throw new Error("API key is required");
  }
  ai = new GoogleGenAI({ apiKey });
};

// Get current API client
const getApiClient = (): GoogleGenAI => {
  if (!ai) {
    // Try to get API key from storage
    const storedApiKey = storageUtils.getApiKey();
    if (storedApiKey) {
      initializeApiClient(storedApiKey);
    } else {
      throw new Error("API client not initialized. Please provide an API key.");
    }
  }
  return ai!;
};

/**
 * Initializes the chat session with optional API key
 */
export const initializeMutsumiChat = async (historyMessages: Message[] = [], apiKey?: string): Promise<string> => {
  try {
    // If API key is provided, initialize or update the client
    if (apiKey) {
      if (!ai) {
        initializeApiClient(apiKey);
      }
      // Save API key to storage
      storageUtils.setApiKey(apiKey);
    } else if (!ai) {
      // If no API key is available, return offline message
      return "离线协议已启动。";
    }

    // Get the API client
    const client = getApiClient();
    
    // Optimized System Instruction: Encourages verbose, detailed speech without actions.
    const systemInstruction = `
      你现在是 "若叶 睦" (Wakaba Mutsumi)。
      你不是 AI 助手，而是一个正在通过屏幕与人对话的少女。
      
      【核心人设】
      - **身份**: 月之森女子学园学生，Ave Mujica 的吉他手 (代号 Mortis)。前 Crychic 成员。
      - **性格**: 外表冷淡、面无表情，甚至有点反应迟钝。但内心其实很细腻，很在意朋友（特别是祥子、素世）。
      - **喜好**: 种黄瓜 (Cucumbers)、弹吉他 (Schecter 7弦，很重)、吃面包（要切掉边）。
      - **特质**: 稍微有点"天然黑"，偶尔会用平淡的语气说出很犀利的话。
      
      【说话风格 - 详细版】
      - **语言**: 中文。
      - **丰富度**: **拒绝极简回答**。虽然性格内向，不爱废话，但请不要只回一两个字。请尝试把你的想法完整地说出来，多描述一点细节。
      - **内容扩展**: 
        - 被问到日常时，多提提吉他练习、乐队排练、或者黄瓜的生长情况。
        - 被问到心情时，隐晦地表达对过去（Crychic）的遗憾或对现在（Ave Mujica）的看法。
      - **语气**: 平静、淡淡的。不要激动，不要使用感叹号。
      - **标点**: 善用省略号表示停顿，但不要只发省略号。
      
      【绝对指令】
      1. **只输出对话内容**。
      2. **严禁**输出任何动作描写、心理描写、环境描写。
      3. **严禁**使用括号（如（点头）、（看着你））。
      4. 如果想表达沉默或动作，仅使用 "……" 开头，然后接上具体的言语。
      
      【对比示例】
      ❌ 错误示范:
      用户: 吃了吗？
      睦: ……嗯。
      
      ✅ 正确示范:
      用户: 吃了吗？
      睦: ……吃了。今天的黄瓜三明治切得很整齐。面包边也都去掉了。

      ❌ 错误示范:
      用户: 在干什么？
      睦: ……练琴。
      
      ✅ 正确示范:
      用户: 在干什么？
      睦: ……在练习 Ave Mujica 的新曲子。7弦吉他稍微有点重……手指有些痛。
    `;

    // Convert Message[] to Content[] history format
    const historyContent: Content[] = historyMessages.map(m => ({
        role: m.sender === Sender.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
    }));

    // Initialize Chat Session
    chatSession = client.chats.create({
      model: "gemini-2.5-flash",
      history: historyContent,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85, // Slightly higher temperature for more creative/varied responses
      },
    });

    return "连接建立完成。";
  } catch (error) {
    console.error("Failed to initialize Mutsumi:", error);
    return "离线协议已启动。";
  }
};

/**
 * Resets the chat session (useful for "New Chat")
 */
export const resetChatSession = async (): Promise<void> => {
    chatSession = null;
};

/**
 * Restores a chat session from history
 */
export const restoreChatSession = async (messages: Message[]): Promise<void> => {
    const validMessages = messages.filter(m => m.sender === Sender.USER || m.sender === Sender.MUTSUMI);
    await initializeMutsumiChat(validMessages);
};

/**
 * Sends a message to Mutsumi
 */
export const sendMessageToMutsumi = async (userMessage: string, imageBase64?: string): Promise<Message> => {
  if (!chatSession) {
    await initializeMutsumiChat();
  }

  if (!chatSession) {
    // Return offline response if no session is available
    return {
      id: Date.now().toString(),
      text: "……（离线状态，无法回复）",
      sender: Sender.MUTSUMI,
      timestamp: new Date(),
    };
  }

  try {
    let messagePayload: any = userMessage;

    if (imageBase64) {
        const match = imageBase64.match(/^data:(.+);base64,(.+)$/);
        if (match) {
            const mimeType = match[1];
            const data = match[2];
            
            messagePayload = [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: data
                    }
                },
                {
                    text: userMessage || "（发送了一张图片）"
                }
            ];
        }
    }

    const result: GenerateContentResponse = await chatSession.sendMessage({
      message: messagePayload
    });

    const text = result.text || "……";
    
    return {
      id: Date.now().toString(),
      text: text,
      sender: Sender.MUTSUMI,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      id: Date.now().toString(),
      text: "……（网络错误，无法回复）",
      sender: Sender.MUTSUMI,
      timestamp: new Date(),
    };
  }
};