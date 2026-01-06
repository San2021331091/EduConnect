export interface Message {
  id: string;
  content?: string;
  file?: File;
  sender: string;
  createdAt: string;
};