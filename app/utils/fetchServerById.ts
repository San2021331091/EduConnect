import axios from "axios";
import { Server } from "../model/server/server";

export const fetchServerById = async (id: string): Promise<Server> => {
  const token = localStorage.getItem("jwt");
  if (!token) throw new Error("JWT token not found");

  const { data } = await axios.get<Server>(
    `${process.env.NEXT_PUBLIC_FIBER_URL}/servers/${id}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),

    profile: {
      ...data.profile,
      createdAt: new Date(data.profile.createdAt),
      updatedAt: new Date(data.profile.updatedAt),
    },

    members: data.members.map((m) => ({
      ...m,
      createdAt: new Date(m.createdAt),
      updatedAt: new Date(m.updatedAt),

    
      profile: m.profile
        ? {
            ...m.profile,
            imgURL: m.profile.imgURL,
            createdAt: new Date(m.profile.createdAt),
            updatedAt: new Date(m.profile.updatedAt),
          }
        : null,
    })),

    channels: data.channels.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    })),
  };
};
