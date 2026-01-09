'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

const InviteCodePage: React.FC = (): React.JSX.Element => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!inviteCode) return;

    const joinServer = async () => {
      try {
        // Call backend to join server
        const token = localStorage.getItem('jwt'); 
        if (!token) {
          router.replace('/login');
          return;
        }

        const { data: server } = await axios.post(
          `${process.env.NEXT_PUBLIC_FIBER_URL}/servers/${inviteCode}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Redirect to the server page
        router.replace(`/servers/${server.id}`);
      } catch (error) {
        console.error('Invite join error:', error);
        router.replace('/');
      }
    };

    joinServer();
  }, [inviteCode, router]);

  return null;
};

export default InviteCodePage;