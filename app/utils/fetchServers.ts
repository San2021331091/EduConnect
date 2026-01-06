import axios from "axios";
import { Server } from "../model/server/server";


export const fetchServers = async (): Promise<Server[]> => {
  try {
    const { data } = await axios.get<Server[]>(
      `${process.env.NEXT_PUBLIC_FIBER_URL}/servers`,
      {
         
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

 
    return data.map(server => ({
      ...server,
      createdAt: new Date(server.createdAt),
      updatedAt: new Date(server.updatedAt),
    }));
  } catch (err) {
    console.error("Failed to fetch servers:", err);
    throw err;
  }
};
