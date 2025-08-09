export interface Message {
  id: string;
  room: string;
  username: string;
  message: string;
  timestamp: Date;
  avatar?: string;
}

export interface User {
  username: string;
  avatar?: string;
  isTyping?: boolean;
}

export interface ChatRoom {
  name: string;
  users: string[];
  lastMessage?: Message;
}

export interface TypingUser {
  username: string;
  isTyping: boolean;
}