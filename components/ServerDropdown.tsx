'use client';

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  UserPlus,
  Settings,
  Users,
  PlusCircle,
  Trash2,
  LogOut,
} from "lucide-react";

import InviteFriendsModal from "./modals/InviteFriendsModal";
import ServerSettingsModal from "./modals/ServerSettingsModal";
import ManageMembersModal from "./modals/ManageMembersModal";
import CreateChannelModal from "./modals/CreateChannelModal";
import DeleteServerModal from "./modals/DeleteServerModal";
import LeaveServerModal from "./modals/LeaveServerModal";

import { Server } from "@/app/model/server/server";
import { fetchUser } from "@/app/utils/fetchUser";
import { MemberRole } from "@/app/model/member/member";
import { useRouter } from "next/navigation";

interface ServerDropdownProps {
  server: Server;
}

const ServerDropdown: React.FC<ServerDropdownProps> = ({ server }) => {
  const serverName = server.name;
  const inviteLink = `${window.location.origin}/invite/${server.inviteCode}`;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isDeleteServerOpen, setIsDeleteServerOpen] = useState(false);
  const [isLeaveServerOpen, setIsLeaveServerOpen] = useState(false);
  const router = useRouter();
  const [memberRole, setMemberRole] = useState<MemberRole>(MemberRole.GUEST);

  // ====================== GET CURRENT USER ======================
  useEffect(() => {
    const loadUserRole = async () => {
      const user = await fetchUser();
      if (!user) return;

      const member = server.members.find((m) => m.userID === user.userID);
      if (member) {
        setMemberRole(member.role as MemberRole);
      }
    };

    loadUserRole();
  }, [server.members]);

  // ====================== CLICK OUTSIDE ======================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ====================== MENU ITEMS ======================
  const menuItems = [];

  // Everyone can invite people
  menuItems.push({
    label: "Invite People",
    icon: <UserPlus className="h-4 w-4 mr-2" />,
    onClick: () => setIsInviteOpen(true),
  });

  // Admin-only items
  if (memberRole === "ADMIN") {
    menuItems.push(
      {
        label: "Server Settings",
        icon: <Settings className="h-4 w-4 mr-2" />,
        onClick: () => setIsSettingsOpen(true),
      },
      {
        label: "Manage Members",
        icon: <Users className="h-4 w-4 mr-2" />,
        onClick: () => setIsManageMembersOpen(true),
      },
      {
        label: "Create Channel",
        icon: <PlusCircle className="h-4 w-4 mr-2" />,
        onClick: () => setIsCreateChannelOpen(true),
      },
      {
        label: "Delete Server",
        icon: <Trash2 className="h-4 w-4 mr-2" />,
        onClick: () => setIsDeleteServerOpen(true),
        danger: true,
      }
    );
  }

  // Only MODERATOR or GUEST can leave the server
  if (memberRole !== "ADMIN") {
    menuItems.push({
      label: "Leave Server",
      icon: <LogOut className="h-4 w-4 mr-2" />,
      onClick: () => setIsLeaveServerOpen(true),
      danger: true,
    });
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="w-full flex justify-between items-center px-4 py-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        {serverName}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-background border rounded-md shadow-lg z-50">
          <ul className="flex flex-col text-sm">
            {menuItems.map((item, idx) => (
              <li key={idx}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start px-4 py-2 flex items-center hover:bg-muted ${
                    item.danger ? "hover:bg-red-600 hover:text-white" : ""
                  }`}
                  onClick={item.onClick}
                >
                  {item.icon}
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* MODALS */}
      <InviteFriendsModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        inviteLink={inviteLink}
      />
      <ServerSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        serverName={serverName}
        serverId={server.id}
      />
      <ManageMembersModal
        isOpen={isManageMembersOpen}
        onClose={() => setIsManageMembersOpen(false)}
        server={server}
      />
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        serverID={server.id}
      />
      <DeleteServerModal
        isOpen={isDeleteServerOpen}
        onClose={() => setIsDeleteServerOpen(false)}
        serverName={serverName}
        serverID={server.id}
      />
      <LeaveServerModal
        isOpen={isLeaveServerOpen}
        onClose={() => setIsLeaveServerOpen(false)}
        serverName={serverName}
        serverMembers={server.members}
        onLeave={() => router.push("/") }
      />
    </div>
  );
};

export default ServerDropdown;
