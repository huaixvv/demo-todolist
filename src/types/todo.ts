export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  aiGenerated?: boolean;
}

export interface AppData {
  todos: Todo[];
}

export type FilterType = 'all' | 'active' | 'completed';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
