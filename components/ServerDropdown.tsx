"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  UserPlus,
  Settings,
  Users,
  PlusCircle,
  Trash2,
} from "lucide-react";
import InviteFriendsModal from "./modals/InviteFriendsModal";
import ServerSettingsModal from "./modals/ServerSettingsModal";
import ManageMembersModal from "./modals/ManageMembersModal";
import { Server } from "@/app/model/server/server";


interface ServerDropdownProps {
   server: Server;  
 
}

const ServerDropdown: React.FC<ServerDropdownProps> = ({
  server

}) => {
    const serverName = server.name;
    const inviteLink = "http://localhost:8080/invite/"+server.inviteCode;
  const [open, setOpen] = useState<boolean>(false);
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);

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

  const menuItems = [
    {
      label: "Invite People",
      icon: <UserPlus className="h-4 w-4 mr-2" />,
      onClick: () => setIsInviteOpen(true),
    },
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
      onClick: () => alert("Create Channel"),
    },
    {
      label: "Delete Server",
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      onClick: () => alert("Delete Server"),
      danger: true,
    },
  ];

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

      {/* Invite Friends Modal */}
      <InviteFriendsModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        inviteLink={inviteLink}
      />

      {/**Server Settings Modal */}
      <ServerSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        serverName={serverName}

    
      />

      
      {/**Manage Member Modal */}
 
   <ManageMembersModal
  isOpen={isManageMembersOpen}
  onClose={() => setIsManageMembersOpen(false)}
  server={server}
/>
   </div>
  );
};

export default ServerDropdown;
