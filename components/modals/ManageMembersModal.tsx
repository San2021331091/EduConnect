"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Server } from "@/app/model/server/server";
import axios from "axios";
import { fetchUser } from "@/app/utils/fetchUser";
import { MemberRole } from "@/app/model/member/member";

// Utility to generate a consistent gradient from a string
const stringToGradient = (str: string) => {
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < str.length; i++) {
    hash1 = str.charCodeAt(i) + ((hash1 << 5) - hash1);
    hash2 = str.charCodeAt(i) + ((hash2 << 7) - hash2);
  }
  const hue1 = hash1 % 360;
  const hue2 = hash2 % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%), hsl(${hue2}, 70%, 60%))`;
};

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server;
}

const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
  isOpen,
  onClose,
  server,
}) => {
  const [members, setMembers] = useState(server.members);
  const [currentUserRole, setCurrentUserRole] = useState<MemberRole>(
    MemberRole.GUEST
  );
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadUserRole = async () => {
      const user = await fetchUser();
      if (!user) return;
      const member = server.members.find((m) => m.userID === user.userID);
      if (member) setCurrentUserRole(member.role as MemberRole);
    };
    loadUserRole();
  }, [server.members]);

  const handleRemove = async (memberId: string) => {
    if (currentUserRole !== MemberRole.ADMIN) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_FIBER_URL}/members/${memberId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
        }
      );

      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setAlertMessage("Member removed successfully!");
    } catch (err) {
      console.error(err);
      setAlertMessage("Failed to remove member.");
    }
  };

  const handlePromote = async (memberId: string) => {
    if (currentUserRole !== MemberRole.ADMIN) return;

    try {
      const member = members.find((m) => m.id === memberId);
      if (!member) return;

      // Toggle role
      const newRole =
        member.role === MemberRole.GUEST
          ? MemberRole.MODERATOR
          : MemberRole.ADMIN;

      // Send only role in PUT request
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_FIBER_URL}/members/${memberId}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` } }
      );

      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: data.role } : m))
      );

      setAlertMessage(`${member.profileID} promoted to ${data.role}!`);
    } catch (err) {
      console.error(err);
      setAlertMessage("Failed to promote member.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
        </DialogHeader>

        {/* Alert */}
        {alertMessage && (
          <Alert className="mb-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3 mt-4 max-h-80 overflow-y-auto">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 p-2 rounded hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback
                    className="text-white font-bold flex items-center justify-center"
                    style={{ background: stringToGradient(member.userID) }}
                  >
                    {member.role[0]}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-sm font-medium">{member.role}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.profileID}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    currentUserRole !== MemberRole.ADMIN ||
                    member.role === MemberRole.ADMIN
                  }
                  onClick={() => handlePromote(member.id)}
                >
                  Promote
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={currentUserRole !== MemberRole.ADMIN}
                  onClick={() => handleRemove(member.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              No members in the server.
            </p>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageMembersModal;
