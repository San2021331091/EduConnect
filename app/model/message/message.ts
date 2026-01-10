export enum MessageType{
  TEXT = "TEXT",
  FILE = "FILE"
} 

export interface Message {
  id: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  senderId: string;  
  sender: string;
  createdAt: string;
  type: MessageType; // <--- add this
}
