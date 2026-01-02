import { Channel } from "diagnostics_channel";
import { Member } from "../member/member";
import { User } from "../user/user";

export interface Server {
  id: string;              // UUID
  name: string;
  imageURL: string;
  inviteCode: string;
  profileID: string;
  profile: User;        
  members: Member[];       // array of members
  channels: Channel[];     // array of channels
  createdAt: Date;
  updatedAt: Date;
  userID: string;
}
