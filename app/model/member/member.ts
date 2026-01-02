import { Server } from "../server/server";
import { User } from "../user/user";

export type MemberRole = "ADMIN" | "MODERATOR" | "GUEST";

export interface Member {
  id: string;             // UUID
  role: MemberRole;       
  profileID: string;
  userID: string;
  profile: User;       
  serverID: string;
  server: Server;        
  createdAt: Date;
  updatedAt: Date;
}
