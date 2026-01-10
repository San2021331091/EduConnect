// fetchServers.ts
import axios from "axios";
import { Server } from "../model/server/server";

export const fetchServers = async (): Promise<Server[]> => {
  const token = localStorage.getItem("jwt");
  if (!token) throw new Error("JWT token not found");

  const { data } = await axios.get<Server[]>(`${process.env.NEXT_PUBLIC_FIBER_URL}/servers`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return data.map(server => ({
    ...server,
    createdAt: new Date(server.createdAt),
    updatedAt: new Date(server.updatedAt),
  }));
};

