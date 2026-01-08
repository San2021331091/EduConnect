"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import { fetchUser } from "@/app/utils/fetchUser";
import { useRouter } from "next/navigation";
import { fetchServers } from "@/app/utils/fetchServers";
import { Server } from "@/app/model/server/server";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NavigationModal from "../modals/navigation-modal";
import { User } from "@/app/model/user/user";
import { User2Icon } from "lucide-react";

const NavigationSidebar: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await fetchUser();
        if (!currentUser) {
          router.replace("/");
          return;
        }
        setUser(currentUser);

        const allServers = await fetchServers();

        // ✅ Filter servers: owned OR joined
        const userServers = allServers.filter(
          (server) =>
            server.userID === currentUser.userID ||
            server.members.some((m) => m.userID === currentUser.userID)
        );

        setServers(userServers);
      } catch (err) {
        console.error("Failed to fetch servers:", err);
        setServers([]);
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, [router]);

  if (loading) return null;

  const createServer = () => {
    setActive("add");
    setIsModalOpen(true);
  };

  const goToServer = (id: string) => {
    setActive(id);
    router.push(`/servers/${id}`);
  };

  return (
    <>
      <aside className="flex flex-col justify-between w-20 h-screen bg-blue-50 dark:bg-zinc-900 border-r border-blue-200 dark:border-zinc-700">
        {/* TOP */}
        <div className="flex flex-col items-center py-4 space-y-4">
          {/* ADD SERVER */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={createServer}
                  data-active={active === "add"}
                  className={cn(
                    "w-12 h-12 rounded-full border border-blue-300 dark:border-zinc-700",
                    "bg-blue-100 dark:bg-zinc-800",
                    "text-blue-900 dark:text-zinc-100",
                    "hover:bg-green-600 hover:text-white",
                    "data-[active=true]:bg-green-600 data-[active=true]:text-white",
                    "transition-all"
                  )}
                >
                  <Plus />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="text-green-600 font-medium"
              >
                Create Server
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-8 h-px bg-blue-300 dark:bg-zinc-700 my-2" />

          {/* SERVERS */}
          <ScrollArea className="flex-1">
            <div className="flex flex-col items-center space-y-3">
              {servers.map((server) => (
                <TooltipProvider key={server.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        onClick={() => goToServer(server.id)}
                        data-active={active === server.id}
                        className={cn(
                          "w-12 h-12 rounded-full overflow-hidden border border-blue-300 dark:border-zinc-700",
                          "bg-blue-100 dark:bg-zinc-800",
                          "hover:bg-green-600 hover:text-white hover:rounded-xl",
                          "data-[active=true]:bg-green-600 data-[active=true]:text-white",
                          "transition-all"
                        )}
                      >
                        <Avatar className="w-full h-full">
                          <AvatarImage src={server.imageURL} />
                          <AvatarFallback>
                            {server.name?.[0] ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{server.name}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col items-center space-y-4 py-4">
          <Button
            size="icon"
            className="w-12 h-12 rounded-full border border-amber-800 bg-amber-700 text-amber-50 hover:bg-amber-800 transition-all"
          >
            <Avatar className="w-full h-full bg-red-500!">
              <AvatarFallback className="flex items-center justify-center bg-red-700">
                <User2Icon className="w-6 h-6 text-white" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </aside>

      {/* MODAL */}
      {isModalOpen && user && (
        <NavigationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentUser={user}
        />
      )}
    </>
  );
};

export default NavigationSidebar;
