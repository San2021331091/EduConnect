import { Channel } from "../channels/channels";
import { Member } from "../member/member";
import { User } from "../user/user";

export interface Server {
  id: string;
  name: string;
  imageURL: string;
  inviteCode: string;
  profileID: string;
  profile: User;
  members: Member[];
  channels: Channel[];
  createdAt: Date;
  updatedAt: Date;
  userID: string;
}
