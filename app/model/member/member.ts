import { Server } from "../server/server";
import { User } from "../user/user";

export enum MemberRole{ADMIN = "ADMIN" ,MODERATOR = "MODERATOR" , GUEST= "GUEST"};

export interface Member {
  id: string;
  role: MemberRole;
  profileID: string;
  userID: string;
  profile?: User;
  serverID: string;
  server?: Server;
  createdAt: Date;
  updatedAt?: Date;
}
