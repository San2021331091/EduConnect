"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InitialModals from "@/components/modals/InitialModals";
import { CircularProgress } from "@/components/ui/circular-progress";
import { fetchUser } from "../utils/fetchUser";
import { User } from "../model/user/user";

const SetUpPage: React.FC = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    // Smooth progress animation
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 2 : prev));
    }, 120);

    const getUser = async () => {
      const user = await fetchUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      setTimeout(() => {
        setProgress(100);
        setCurrentUser(user);
        setLoading(false);
        clearInterval(interval);
      }, 800);
    };

    getUser();
    return () => clearInterval(interval);
  }, [router]);

  if (loading)
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#1E1F22]">
        <CircularProgress value={progress} size={80} />
        <p className="mt-4 text-sm text-[#B5BAC1]">
          Setting up your workspace…
        </p>
      </div>
    );

  if (!currentUser) return null;

  return <InitialModals currentUser={currentUser} />;
};

export default SetUpPage;
