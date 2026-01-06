import { Server } from "../server/server";
import { Member } from "../member/member";
import { Channel } from "../channels/channels";

export interface User {
  userID: string;
  name?: string;
  imgURL?: string;
  email: string;
  password?: string;
  servers?: Server[];
  members?: Member[];
  channels?: Channel[];
  createdAt?: Date; 
  updatedAt?: Date;
}
