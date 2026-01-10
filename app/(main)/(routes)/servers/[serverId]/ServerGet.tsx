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

import { Pencil, Trash2 } from "lucide-react";
import { Channel } from "@/app/model/channels/channels";
import EditChannelModal from "@/components/modals/EditChannelModal";
import DeleteChannelAlert from "@/components/modals/DeleteChannelAlert";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ServerGet: React.FC = (): React.JSX.Element => {
  const params = useParams<{ serverId: string }>();

  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editModalChannel, setEditModalChannel] = useState<Channel | null>(
    null
  );
  const [deleteModalChannel, setDeleteModalChannel] = useState<Channel | null>(
    null
  );

  const [channelSearch, setChannelSearch] = useState<string>("");
  const [showWelcome, setShowWelcome] = useState<boolean>(false);

  /* ================= LOAD SERVER & USER ================= */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const user = await fetchUser();
      setCurrentUser(user);

      // If serverId === user.userID, show welcome alert instead of fetching server
      if (params?.serverId === user?.userID) {
        setShowWelcome(true);
        setServer(null); // no server yet
        setActiveChannelId(null);
        setLoading(false);
        return;
      }
      

      // Otherwise, fetch server normally
      const serverData = params?.serverId
        ? await fetchServerById(params?.serverId)
        : null;
      setServer(serverData);
      setActiveChannelId(serverData?.channels[0]?.id ?? null);
      setLoading(false);
    };

    loadData();
  }, [params?.serverId]);

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
 
  if (showWelcome && currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-full max-w-md px-4">
          <Alert>
            <AlertTitle>Welcome!</AlertTitle>
            <AlertDescription>
              Welcome to your server! Start by creating channels to invite your
              friends.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }
  if (!server || !currentUser ) {
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
          <ServerDropdown server={server} setServer={setServer} />
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
          {/* ================= TEXT CHANNELS ================= */}
          {groupedChannels.TEXT.length > 0 && (
            <div>
              <p className="px-2 mb-1 text-xs font-semibold text-muted-foreground">
                TEXT CHANNELS
              </p>
              {groupedChannels.TEXT.map((channel: Channel) => (
                <div
                  key={channel.id}
                  className="relative flex items-center w-full justify-between mb-1 group"
                >
                  <Button
                    variant={
                      activeChannelId === channel.id ? "secondary" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setActiveChannelId(channel.id)}
                  >
                    {channel.name.toUpperCase()}
                  </Button>

                  {/* Edit Icon */}
                  <Pencil
                    size={16}
                    className="absolute right-8 hidden group-hover:block cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setEditModalChannel(channel)}
                  />

                  {/* Delete Icon */}

                  <Trash2
                    size={16}
                    className={`absolute right-2 hidden group-hover:block cursor-pointer text-red-500 hover:text-red-600 ${
                      server.channels.length === 1
                        ? "opacity-40 cursor-not-allowed hover:text-red-500"
                        : ""
                    }`}
                    onClick={() => {
                      if (server.channels.length > 1)
                        setDeleteModalChannel(channel);
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ================= AUDIO CHANNELS ================= */}
          {groupedChannels.AUDIO.length > 0 && (
            <div>
              <p className="px-2 mb-1 text-xs font-semibold text-muted-foreground">
                AUDIO CHANNELS
              </p>
              {groupedChannels.AUDIO.map((channel: Channel) => (
                <div
                  key={channel.id}
                  className="relative flex items-center w-full justify-between mb-1 group"
                >
                  <Button
                    variant={
                      activeChannelId === channel.id ? "secondary" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setActiveChannelId(channel.id)}
                  >
                    🔊 {channel.name.toUpperCase()}
                  </Button>

                  {/* Edit Icon */}
                  <Pencil
                    size={16}
                    className="absolute right-8 hidden group-hover:block cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setEditModalChannel(channel)}
                  />

                  {/* Delete Icon */}
                  <Trash2
                    size={16}
                    className={`absolute right-2 hidden group-hover:block cursor-pointer text-red-500 hover:text-red-600 ${
                      server.channels.length === 1
                        ? "opacity-40 cursor-not-allowed hover:text-red-500"
                        : ""
                    }`}
                    onClick={() => {
                      if (server.channels.length > 1)
                        setDeleteModalChannel(channel);
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ================= VIDEO CHANNELS ================= */}
          {groupedChannels.VIDEO.length > 0 && (
            <div>
              <p className="px-2 mb-1 text-xs font-semibold text-muted-foreground">
                VIDEO CHANNELS
              </p>
              {groupedChannels.VIDEO.map((channel: Channel) => (
                <div
                  key={channel.id}
                  className="relative flex items-center w-full justify-between mb-1 group"
                >
                  <Button
                    variant={
                      activeChannelId === channel.id ? "secondary" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setActiveChannelId(channel.id)}
                  >
                    📹 {channel.name.toUpperCase()}
                  </Button>

                  {/* Edit Icon */}
                  <Pencil
                    size={16}
                    className="absolute right-8 hidden group-hover:block cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setEditModalChannel(channel)}
                  />

                  {/* Delete Icon */}

                  <Trash2
                    size={16}
                    className={`absolute right-2 hidden group-hover:block cursor-pointer text-red-500 hover:text-red-600 ${
                      server.channels.length === 1
                        ? "opacity-40 cursor-not-allowed hover:text-red-500"
                        : ""
                    }`}
                    onClick={() => {
                      if (server.channels.length > 1)
                        setDeleteModalChannel(channel);
                    }}
                  />
                </div>
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
            channelId={activeChannel?.id}
            userId={currentUser?.userID}
            server={server}
          />
        )}

        {activeChannel?.type === "VIDEO" && (
          <VideoChannel
            channelId={activeChannel?.id}
            userId={currentUser?.userID}
            server={server}
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
      {/* EDIT MODAL */}
      {editModalChannel && (
        <EditChannelModal
          channelId={editModalChannel.id}
          initialName={editModalChannel.name}
          onUpdate={(newName) => {
            setServer((prev) =>
              prev
                ? {
                    ...prev,
                    channels: prev.channels.map((c) =>
                      c.id === editModalChannel.id ? { ...c, name: newName } : c
                    ),
                  }
                : prev
            );
          }}
          onClose={() => setEditModalChannel(null)} // modal disappears
        />
      )}

      {/* DELETE MODAL */}
      {deleteModalChannel && (
        <DeleteChannelAlert
          channelId={deleteModalChannel.id}
          onDelete={() => {
            setServer((prev) =>
              prev
                ? {
                    ...prev,
                    channels: prev.channels.filter(
                      (c) => c.id !== deleteModalChannel.id
                    ),
                  }
                : prev
            );
            if (activeChannelId === deleteModalChannel.id)
              setActiveChannelId(null);
          }}
          onClose={() => setDeleteModalChannel(null)} // closes the modal
        />
      )}
    </div>
  );
};

export default ServerGet;
