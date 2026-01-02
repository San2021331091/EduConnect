'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import InitialModals from '@/components/modals/InitialModals';
import { User } from '../model/user/user';
import { fetchUser } from '../utils/fetchUser';

const SetUpPage: React.FC = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const user = await fetchUser();
      if (!user) {
        router.push('/sign-in'); // Redirect if no user
        return;
      }
      setCurrentUser(user);
      setLoading(false);
    };

    getUser();
  }, [router]);

  if (loading) return <p className="text-center mt-20 text-white">Loading...</p>;
  if (!currentUser) return null; // Redirect will happen automatically

  return <InitialModals currentUser={currentUser} />;
};

export default SetUpPage;
