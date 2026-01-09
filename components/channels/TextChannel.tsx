"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Plus, Send, File, Image as ImageIcon, Video } from "lucide-react";
import NextImage from "next/image";

import { Message, MessageType } from "@/app/model/message/message";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Server } from "@/app/model/server/server";

interface TextChannelProps {
  channelId: string;
  userId: string;
  server: Server; 
}

const TextChannel: React.FC<TextChannelProps> = ({
  channelId,
  userId,
 server
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= WEBSOCKET ================= */
  useEffect(() => {
    ws.current = new WebSocket(
      `${process.env.NEXT_PUBLIC_FIBER_WEBSOCKET_URL}/ws/channel/${channelId}`
    );

    ws.current.onmessage = (event) => {
      const msg: Message = JSON.parse(event.data);
      if (!msg.senderId || !msg.createdAt) return;
      setMessages((prev) => [...prev, msg]);
    };

    return () => ws.current?.close();
  }, [channelId]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!userId || (!input.trim() && !file)) return;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      const cloudinaryType = file.type.startsWith("image/") ? "image" : "raw";

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${cloudinaryType}/upload`,
        formData
      );

      ws.current?.send(
        JSON.stringify({
          id: crypto.randomUUID(),
          type: MessageType.FILE,
          fileUrl: res.data.secure_url,
          fileName: res.data.original_filename,
          senderId: userId,
          channelId,
          createdAt: new Date().toISOString(),
        })
      );

      setFile(null);
      return;
    }

    ws.current?.send(
      JSON.stringify({
        id: crypto.randomUUID(),
        content: input,
        type: MessageType.TEXT,
        senderId: userId,
        channelId,
        createdAt: new Date().toISOString(),
      })
    );

    setInput("");
  };
  const getSenderName = (senderId: string) => {
  const member = server.members.find((m) => m.profile?.userID === senderId);
  return member?.profile?.name || member?.role || "Unknown";
};


  /* ================= UI ================= */
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-6 py-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No messages yet. Send a message 👋
          </p>
        )}

        <div className="space-y-3">
          {messages.map((msg) => {
            const isMe = msg.senderId === userId;

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className="flex gap-2 max-w-[70%]">
                  {!isMe && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {(getSenderName(msg.senderId) || msg.senderId || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <Card
                    className={`px-4 py-2 ${
                      isMe
                        ? "bg-blue-600! text-white!"
                        : "bg-green-500! text-white!"
                    }`}
                  >
                    {/* TEXT MESSAGE */}
                    {msg.type === MessageType.TEXT && (
                      <p className="text-sm">{msg.content}</p>
                    )}

                    {/* FILE MESSAGE */}
                    {msg.type === MessageType.FILE && msg.fileUrl && (
                      <div className="flex flex-col gap-1">
                        {msg.fileName?.endsWith(".jpg") ||
                        msg.fileName?.endsWith(".png") ||
                        msg.fileName?.endsWith(".jpeg") ? (
                          <NextImage
                            src={msg.fileUrl}
                            alt={msg.fileName}
                            width={150}
                            height={100}
                            className="rounded"
                          />
                        ) : msg.fileName?.endsWith(".mp4") ||
                          msg.fileName?.endsWith(".mov") ? (
                          <video width={150} controls>
                            <source src={msg.fileUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="flex items-center gap-2">
                            <File className="w-4 h-4" />
                            <a
                              href={msg.fileUrl}
                              target="_blank"
                              className="text-xs underline truncate max-w-30"
                            >
                              {msg.fileName}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-[10px] opacity-70 text-right mt-1">
                      {isMe ? "You":getSenderName(msg.senderId)} ·{" "}
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </Card>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* INPUT + FILE PREVIEW */}
      <div className="p-4 border-t">
        <div className="flex flex-col gap-1">
          {file && (
            <div className="flex flex-col gap-1 text-xs text-blue-500">
              <div className="flex items-center gap-2">
                {file.type.startsWith("image/") && (
                  <ImageIcon className="w-4 h-4" />
                )}
                {file.type.startsWith("video/") && (
                  <Video className="w-4 h-4" />
                )}
                {!file.type.startsWith("image/") &&
                  !file.type.startsWith("video/") && (
                    <File className="w-4 h-4" />
                  )}
                <span className="truncate max-w-37.5">{file.name}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 items-center bg-muted px-4 py-3 rounded-xl">
            <label>
              <Plus className="h-5 w-5 cursor-pointer" />
              <input
                type="file"
                hidden
                onChange={(e) => {
                  const selected = e.target.files?.[0] || null;
                  setFile(selected);
                }}
              />
            </label>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message"
              className="border-0 bg-transparent"
            />

            <Button size="icon" onClick={sendMessage} className="bg-blue-600!">
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextChannel;
