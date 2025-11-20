
export enum Sender {
  USER = 'USER',
  MUTSUMI = 'MUTSUMI',
  SYSTEM = 'SYSTEM'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isGrounding?: boolean; // If the message is a thought/search process
  image?: string; // Base64 encoded image data
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isInitializing: boolean;
}

export interface CharacterProfile {
  description: string;
  traits: string[];
}

export interface Session {
  id: string;
  title: string;
  lastModified: number;
  messages: Message[];
}
