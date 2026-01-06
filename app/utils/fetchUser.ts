'use client';
import { getUser } from '@/auth/auth';
import { User } from '../model/user/user';

export const fetchUser = async (): Promise<User | null> => {
  try {
    const { data, error } = await getUser();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    const user = data.user;

    if (!user) return null;

    const localUser: User = {
      userID: user.id,
      email: user.email || '',
  
    };
  

    return localUser;
  } catch (err) {
    console.error("Unexpected error fetching user:", err);
    return null;
  }
};
