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
    return <div className="p-6 text-muted-foreground">Loading...</div>;
  }

  if (!server) {
    return <div className="p-6">Server not found</div>;
  }

  const activeChannel = server.channels.find((c) => c.id === activeChannelId);

  const messages = messagesByChannel[activeChannelId ?? ""] || [];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* ================= CHANNEL SIDEBAR ================= */}
      <aside className="w-64 border-r bg-muted/40">
        <div className="p-4 font-semibold">
          <ServerDropdown server={server} />
        </div>

        <Separator />

        <div className="px-3 py-2 text-xs text-muted-foreground">
          TEXT CHANNELS
        </div>

        <ScrollArea className="h-[calc(100vh-80px)] px-2">
          {server.channels.map((channel) => (
            <Button
              key={channel.id}
              variant={activeChannelId === channel.id ? "secondary" : "ghost"}
              className="w-full justify-start mb-1"
              onClick={() => setActiveChannelId(channel.id)}
            >
              # {channel.name}
            </Button>
          ))}
        </ScrollArea>
      </aside>

      {/* ================= CHAT ================= */}
      <main className="flex flex-1 flex-col">
        {/* HEADER */}
        <div className="h-12 flex items-center px-4 border-b">
          <span className="font-semibold text-sm"># {activeChannel?.name}</span>
        </div>

        {/* MESSAGES */}
        <ScrollArea className="flex-1 px-6 py-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation 👋
            </p>
          )}

          <div className="space-y-6">
            {messages.map((msg, i) => {
              const prev = messages[i - 1];
              const showHeader = !prev || prev.sender !== msg.sender;

              return (
                <div key={msg.id} className="flex gap-3">
                  {showHeader ? (
                    <Avatar>
                      <AvatarFallback>{msg.sender[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10" />
                  )}

                  <div>
                    {showHeader && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {msg.sender}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    )}

                    {msg.content && (
                      <p className="text-sm mt-1">{msg.content}</p>
                    )}

                    {msg.file && (
                      <p className="text-xs text-blue-500 mt-1">
                        📎 {msg.file.name}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* INPUT BAR */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
            {/* FILE UPLOAD */}
            <label className="cursor-pointer">
              <Plus className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            {/* TEXT INPUT */}
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Message #${activeChannel?.name}`}
              className="border-0 bg-transparent focus-visible:ring-0"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            {/* FILE NAME */}
            {file && (
              <span className="text-xs text-blue-500 max-w-30 truncate">
                {file.name}
              </span>
            )}

            {/* SEND */}
            <Button size="icon" onClick={sendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* ================= MEMBERS ================= */}
      <aside className="w-60 border-l bg-muted/40 hidden md:block">
        <div className="p-3 text-xs text-muted-foreground">
          MEMBERS — {server.members.length}
        </div>

        <ScrollArea className="h-[calc(100vh-48px)] px-3">
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
