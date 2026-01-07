'use client';

import { Message } from "@/app/model/message/message";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TextChannelProps {
  messages: Message[];
  bottomRef: React.RefObject<HTMLDivElement>;
}

const TextChannel: React.FC<TextChannelProps> = ({ messages, bottomRef }) => {
  return (
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
                    <span className="font-semibold text-sm">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}

                {msg.content && <p className="text-sm mt-1">{msg.content}</p>}

                {msg.file && (
                  <p className="text-xs text-blue-500 mt-1">📎 {msg.file.name}</p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};

export default TextChannel;
