"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { fetchServerById } from "@/app/utils/fetchServerById";
import { Server } from "@/app/model/server/server";
import { Message } from "@/app/model/message/message";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Plus, Send } from "lucide-react";
import ServerDropdown from "@/components/ServerDropdown";
import { CircularProgress } from "@/components/ui/circular-progress";

// ✅ NEW IMPORTS FOR CHANNEL TYPES
import TextChannel from "@/components/channels/TextChannel";
import AudioChannel from "@/components/channels/AudioChannel";
import VideoChannel from "@/components/channels/VideoChannel";

const ServerIdPage: React.FC = (): React.JSX.Element => {
  const params = useParams() as { serverId: string };

  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messagesByChannel, setMessagesByChannel] = useState<
    Record<string, Message[]>
  >({});

  const [text, setText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  /* 🔍 SEARCH STATE */
  const [channelSearch, setChannelSearch] = useState<string>("");

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ================= LOAD SERVER ================= */
  useEffect(() => {
    if (!params?.serverId) return;

    const loadServer = async (): Promise<void> => {
      try {
        const data = await fetchServerById(params.serverId);
        setServer(data);
        setActiveChannelId(data.channels[0]?.id ?? null);
      } finally {
        setLoading(false);
      }
    };

    loadServer();
  }, [params.serverId]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesByChannel, activeChannelId]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = (): void => {
    if (!activeChannelId || (!text && !file)) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      content: text || undefined,
      file: file || undefined,
      sender: "You",
      createdAt: new Date().toISOString(),
    };

    setMessagesByChannel((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMessage],
    }));

    setText("");
    setFile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <CircularProgress
          value={50}
          size={60}
          strokeWidth={6}
          className="text-blue-500"
        />
      </div>
    );
  }

  if (!server) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground">
        Server not found
      </div>
    );
  }

  const activeChannel = server.channels.find((c) => c.id === activeChannelId);
  const messages = messagesByChannel[activeChannelId ?? ""] || [];

  /* 🔍 FILTER CHANNELS */
  const filteredChannels = server.channels.filter((channel) =>
    channel.name.toLowerCase().includes(channelSearch.toLowerCase())
  );

  /* ================= GROUP CHANNELS ================= */
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

        {/* 🔍 SEARCH BAR */}
        <div className="px-3 py-2">
          <Input
            value={channelSearch}
            onChange={(e) => setChannelSearch(e.target.value)}
            placeholder="Search channels"
            className="h-8"
          />
        </div>

        {/* ================= CHANNEL LIST ================= */}
        <ScrollArea className="flex-1 px-2 m-3 space-y-4">
          {/* TEXT CHANNELS */}
          {groupedChannels.TEXT.length > 0 && (
            <div>
              <p className="px-2 mb-1 text-xs font-semibold text-muted-foreground">
                TEXT CHANNELS
              </p>
              {groupedChannels.TEXT.map((channel) => (
                <Button
                  key={channel.id}
                  variant={
                    activeChannelId === channel.id ? "secondary" : "ghost"
                  }
                  className="w-full justify-start mb-1"
                  onClick={() => setActiveChannelId(channel.id)}
                >
                  {channel.name.toUpperCase()}
                </Button>
              ))}
            </div>
          )}

          {/* AUDIO CHANNELS */}
          {groupedChannels.AUDIO.length > 0 && (
            <div>
              <p className="px-2 mb-1 text-xs font-semibold text-muted-foreground">
                AUDIO CHANNELS
              </p>
              {groupedChannels.AUDIO.map((channel) => (
                <Button
                  key={channel.id}
                  variant={
                    activeChannelId === channel.id ? "secondary" : "ghost"
                  }
                  className="w-full justify-start mb-1"
                  onClick={() => setActiveChannelId(channel.id)}
                >
                  🔊 {channel.name.toUpperCase()}
                </Button>
              ))}
            </div>
          )}

          {/* VIDEO CHANNELS */}
          {groupedChannels.VIDEO.length > 0 && (
            <div>
              <p className="px-2 mb-1 text-xs font-semibold text-muted-foreground">
                VIDEO CHANNELS
              </p>
              {groupedChannels.VIDEO.map((channel) => (
                <Button
                  key={channel.id}
                  variant={
                    activeChannelId === channel.id ? "secondary" : "ghost"
                  }
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
          <>
            <TextChannel messages={messages} bottomRef={bottomRef} />
            <div className="p-4 border-t">
              <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
                <label className="cursor-pointer">
                  <Plus className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>

                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={"Type a new message"}
                  className="border-0 bg-transparent focus-visible:ring-0"
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />

                {file && (
                  <span className="text-xs text-blue-500 max-w-30 truncate">
                    {file.name}
                  </span>
                )}

                <Button
                  size="icon"
                  onClick={sendMessage}
                  className="bg-blue-600! text-white!"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {activeChannel?.type === "AUDIO" && (
          <AudioChannel
            channelId={activeChannel.id}
            userId={server.userID}
            userName={server.profile.name}
          />
        )}
        {activeChannel?.type === "VIDEO" && <VideoChannel channelId={activeChannel.id} />}
      </main>

      {/* ================= MEMBERS ================= */}
      <aside className="w-60 border-l bg-muted/40 hidden md:block">
        <div className="p-3 text-xs text-muted-foreground">
          MEMBERS — {server.members.length}
        </div>
        <ScrollArea className="h-[calc(100vh-120px)] px-2">
          {server.members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{member.role[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{member.role}</span>
            </div>
          ))}
        </ScrollArea>
      </aside>
    </div>
  );
};

export default ServerIdPage;
