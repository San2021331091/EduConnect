"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { fetchServerById } from "@/app/utils/fetchServerById";
import { fetchUser } from "@/app/utils/fetchUser"; 
import { Server } from "@/app/model/server/server";
import { User } from "@/app/model/user/user";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

import ServerDropdown from "@/components/ServerDropdown";
import { CircularProgress } from "@/components/ui/circular-progress";

import TextChannel from "@/components/channels/TextChannel";
import AudioChannel from "@/components/channels/AudioChannel";
import VideoChannel from "@/components/channels/VideoChannel";

const ServerGet: React.FC = (): React.JSX.Element => {
  const params = useParams<{ serverId: string }>();

  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // ✅ logged-in user

  const [channelSearch, setChannelSearch] = useState<string>("");

  /* ================= LOAD SERVER & USER ================= */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const [serverData, userData] = await Promise.all([
        params?.serverId ? fetchServerById(params.serverId) : null,
        fetchUser()
      ]);

      setServer(serverData);
      setCurrentUser(userData);
      setActiveChannelId(serverData?.channels[0]?.id ?? null);
      setLoading(false);
    };

    loadData();
  }, [params.serverId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <CircularProgress value={50} size={60} strokeWidth={6} className="text-blue-500" />
      </div>
    );
  }

  if (!server || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground">
        Server or user not found
      </div>
    );
  }

  const activeChannel = server.channels.find((c) => c.id === activeChannelId);

  /* FILTER CHANNELS */
  const filteredChannels = server.channels.filter((channel) =>
    channel.name.toLowerCase().includes(channelSearch.toLowerCase())
  );

  /* GROUP CHANNELS */
  const groupedChannels = {
    TEXT: filteredChannels.filter((c) => c.type === "TEXT"),
    AUDIO: filteredChannels.filter((c) => c.type === "AUDIO"),
    VIDEO: filteredChannels.filter((c) => c.type === "VIDEO"),
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* ================= CHANNEL SIDEBAR ================= */}
      <aside className="w-64 border bg-muted/40">
        <div className="p-4 font-semibold">
          <ServerDropdown server={server} />
        </div>

        <Separator />

        <div className="px-3 py-2">
          <Input
            value={channelSearch}
            onChange={(e) => setChannelSearch(e.target.value)}
            placeholder="Search channels"
            className="h-8"
          />
        </div>

        <ScrollArea className="flex-1 px-2 m-3 space-y-4">
          {groupedChannels.TEXT.length > 0 && (
            <div>
              <p className="px-2 mb-1 text-xs font-semibold text-muted-foreground">
                TEXT CHANNELS
              </p>
              {groupedChannels.TEXT.map((channel) => (
                <Button
                  key={channel.id}
                  variant={activeChannelId === channel.id ? "secondary" : "ghost"}
                  className="w-full justify-start mb-1"
                  onClick={() => setActiveChannelId(channel.id)}
                >
                  {channel.name.toUpperCase()}
                </Button>
              ))}
            </div>
          )}

          {groupedChannels.AUDIO.length > 0 && (
            <div>
              <p className="px-2 mb-1 text-xs font-semibold text-muted-foreground">
                AUDIO CHANNELS
              </p>
              {groupedChannels.AUDIO.map((channel) => (
                <Button
                  key={channel.id}
                  variant={activeChannelId === channel.id ? "secondary" : "ghost"}
                  className="w-full justify-start mb-1"
                  onClick={() => setActiveChannelId(channel.id)}
                >
                  🔊 {channel.name.toUpperCase()}
                </Button>
              ))}
            </div>
          )}

          {groupedChannels.VIDEO.length > 0 && (
            <div>
              <p className="px-2 mb-1 text-xs font-semibold text-muted-foreground">
                VIDEO CHANNELS
              </p>
              {groupedChannels.VIDEO.map((channel) => (
                <Button
                  key={channel.id}
                  variant={activeChannelId === channel.id ? "secondary" : "ghost"}
                  className="w-full justify-start mb-1"
                  onClick={() => setActiveChannelId(channel.id)}
                >
                  📹 {channel.name.toUpperCase()}
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex flex-1 flex-col m-3">
        {/* HEADER */}
        <div className="h-12 flex items-center px-4 border-b ">
          <span className="font-semibold text-sm">
            {activeChannel?.name.toUpperCase()}
          </span>
        </div>

        {/* DYNAMIC CHANNEL RENDERING */}
        {activeChannel?.type === "TEXT" && (
          <TextChannel
            channelId={activeChannel?.id}
            userId={currentUser?.userID}    
             server={server}  
          />
        )}

        {activeChannel?.type === "AUDIO" && (
          <AudioChannel
            channelId={activeChannel.id}
            userId={currentUser.userID}    
            userName={currentUser.email}
          />
        )}

        {activeChannel?.type === "VIDEO" && (
          <VideoChannel
            channelId={activeChannel.id}
          />
        )}
      </main>

      {/* ================= MEMBERS ================= */}
      <aside className="w-60 border-l bg-muted/40 hidden md:block">
        <div className="p-3 text-xs text-muted-foreground">
          MEMBERS — {server.members.length}
        </div>
        {server.members.map((member) => {
          const hasImage = Boolean(member?.profile?.imgURL);
          const displayName = member?.profile?.name || member?.role;

          return (
            <div key={member?.id} className="flex items-center gap-3 py-2">
              {hasImage ? (
                <Image
                  src={member?.profile?.imgURL}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="rounded-full border border-gray-300"
                  unoptimized
                />
              ) : (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}

              <span className="text-sm truncate">{displayName}</span>
            </div>
          );
        })}
      </aside>
    </div>
  );
};

export default ServerGet;
