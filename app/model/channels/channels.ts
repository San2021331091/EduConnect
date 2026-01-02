import { Server } from "../server/server";
import { User } from "../user/user";

 export type ChannelType = "TEXT" | "AUDIO" | "VIDEO";


export interface Channel {
  id: string;            
  name: string;
  type: ChannelType;     
  profileID: string;
  profile: User;      
  serverID: string;
  server: Server;       
  createdAt: Date;
  updatedAt: Date;
  userID: string;
}
