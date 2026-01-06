"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import InitialModals from "@/components/modals/InitialModals";
import { CircularProgress } from "@/components/ui/circular-progress";

import { fetchUser } from "../utils/fetchUser";
import { User } from "@/app/model/user/user";

const HomePage: React.FC = () => {
  const router = useRouter();
  const ran = useRef<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect((): void => {
    if (ran.current) return;
    ran.current = true;

    const init = async (): Promise<void> => {
      try {
        const currentUser = await fetchUser();

        if (!currentUser) {
          router.replace("/sign-in");
          return;
        }

        setUser(currentUser);
        setLoading(false);
      } catch {
        router.replace("/sign-in");
      }
    };

    void init();
  }, [router]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#1E1F22]">
        <CircularProgress value={60} size={80} />
      </div>
    );
  }

  return <InitialModals currentUser={user!} />;
};

export default HomePage;
