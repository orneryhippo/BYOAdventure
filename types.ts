export interface StoryState {
  narrative: string;
  options: string[];
  inventory: string[];
  quests: string[];
  imagePrompt: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface GameHistoryItem {
  role: 'user' | 'model';
  text: string;
}

export interface ChatState {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
}