import { Channel } from "../channels/channels";
import { Member } from "../member/member";
import { Server } from "../server/server";


export interface User {
  UserID: string;
  Name?: string;            
  ImgURL?: string;        
  Email: string;          
  Password?: string;       
  Servers?: Server[];       
  Members?: Member[];       
  Channels?: Channel[];     
  CreatedAt?: Date;         
  UpdatedAt?: Date;        
} 
