# ChatWithMuZiMi

一个基于 Gemini AI 的沉浸式角色扮演聊天体验，与《Ave Mujica》中的若叶睦(Wakaba Mutsumi)进行实时对话。

## ✨ 特色功能

### 🎭 角色互动系统
- **戳一戳**: 简单的互动，睦会有各种可爱的反应
- **递吉他拨片**: 音乐主题的互动，触发音乐相关话题
- **一起听歌**: 分享音乐时光，探讨 Ave Mujica 的歌曲
- **注视**: 触发睦的各种表情和反应

### 🥒 黄瓜种植小游戏
- 观察睦的黄瓜从种子到成熟的成长过程
- 通过"浇水"来推进游戏进度
- 收获时会有特殊的庆祝动画

### 🖼️ 多媒体对话
- **图片发送**: 上传图片与睦分享，她会基于图片内容进行回应
- **头像自定义**: 上传个人头像和为睦更换头像
- **响应式设计**: 完美适配桌面和移动设备

### 💾 智能对话管理
- 自动保存对话历史
- 多会话支持，轻松切换不同话题
- 本地存储保护隐私

## 🛠️ 技术栈

- **前端框架**: React 19.2.0 + TypeScript
- **构建工具**: Vite 6.2.0
- **AI 服务**: Google Gemini 2.5 Flash
- **UI 组件**: 自定义组件库
- **状态管理**: React Hooks + LocalStorage
- **样式方案**: CSS3 + 自定义 CSS 变量

## 🚀 本地运行

### 环境要求
- **Node.js** (推荐 18.0+)
- **npm** 或 **yarn**

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd chatWithMuzimi
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置 API 密钥**

   在项目根目录创建 `.env.local` 文件：
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**

   打开浏览器访问: `http://localhost:5173`

## 🔑 获取 Gemini API 密钥

1. 访问 [Google AI Studio](https://aistudio.google.com/)
2. 创建新的 API 密钥
3. 将密钥添加到 `.env.local` 文件中

## 📦 构建生产版本

```bash
npm run build
```

构建文件将生成在 `dist/` 目录中。

## 🎮 使用指南

### 首次使用
1. 启动应用后，Settings 面板会自动打开
2. 输入您的 Gemini API 密钥
3. 点击 "新对话" 开始与睦的第一次相遇

### 日常互动
- **文字对话**: 在输入框中输入消息，睦会基于她的性格和背景进行回应
- **图片分享**: 点击相机图标上传图片，睦会基于图片内容进行评论
- **角色互动**: 使用侧边栏的互动按钮与睦进行特殊互动
- **小游戏**: 尝试"浇水"来体验黄瓜种植的乐趣

### 个性化设置
- **头像上传**: 点击个人头像区域上传自定义头像
- **睦的头像**: 点击睦的头像为她更换不同的外观
- **主题切换**: 在设置中切换不同的视觉主题

## 🎨 角色设定

**若叶 睦 (Wakaba Mutsumi)**
- **身份**: 月之森女子学园学生，Ave Mujica 吉他手 (代号: Mortis)
- **性格**: 外表冷淡但内心细腻，对朋友非常在意
- **爱好**: 弹吉他、种黄瓜、听音乐、吃面包
- **特色**: 偶尔会用平淡语气说出犀利的话

## 🔧 开发命令

```bash
# 开发模式
npm run dev

# 类型检查
npm run type-check

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📁 项目结构

```
chatWithMuzimi/
├── src/
│   ├── components/     # React 组件
│   │   └── Settings.tsx         # 设置面板
│   ├── utils/                  # 工具函数
│   │   └── storage.ts          # 本地存储管理
│   ├── services/               # AI 服务
│   │   └── gemini.ts              # Gemini AI 集成
│   ├── types.ts               # TypeScript 类型定义
│   └── App.tsx                # 主应用组件
├── services/                   # 独立服务模块
├── public/                  # 静态资源
└── 配置文件...
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目！

### 开发流程
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- **Google Gemini AI** - 提供强大的对话能力
- **Ave Mujica** - 角色原型和灵感来源
- **React 社区** - 优秀的技术生态

---