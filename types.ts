export type AppView = 'dashboard' | 'chatbots' | 'editor' | 'leads' | 'history';

export interface ChatbotConfig {
  id: string;
  clientName: string;
  knowledgeBase: string;
  primaryColor: string;
  botMessageColor: string;
  userMessageColor: string;
  buttonColor: string;
  logoUrl: string;
  maxTokens: number;
  captureLeads: boolean;
  status: 'active' | 'paused';
  createdAt: number;
  secretId: string;
  aiProvider?: 'gemini' | 'openrouter';
  apiKey?: string;
  aiModel?: string;
  maxHistoryMessages?: number;
  whatsappNumber?: string;
  whatsappToken?: string;
  whatsappWebhookVerifyToken?: string;
}

export type MessageRole = 'user' | 'model';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}

export interface Lead {
  id: string;
  botId: string;
  name: string;
  email: string;
  phone: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  botId: string;
  leadId?: string;
  startTime: number;
  messages: Message[];
}
