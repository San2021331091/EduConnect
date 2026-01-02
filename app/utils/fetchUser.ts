'use client';
import { User } from '../model/user/user';
import { supabase } from '@/supabase/supabase-client';

export const fetchUser = async (): Promise<User | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    const user = data.user;

    if (!user) return null;

    const localUser: User = {
      UserID: user.id,
      Email: user.email || '',
  
    };
  

    return localUser;
  } catch (err) {
    console.error("Unexpected error fetching user:", err);
    return null;
  }
};
