'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Server } from '@/app/model/server/server';

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server;
}

const ManageMembersModal: React.FC<ManageMembersModalProps> = ({ isOpen, onClose, server }) => {
  const [members, setMembers] = useState(server.members);

  const handleRemove = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
    alert(`Removed member with ID: ${memberId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4 max-h-80 overflow-y-auto">
          {members.map(member => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 p-2 rounded hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{member.role[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{member.role}</p>
                  <p className="text-xs text-muted-foreground">{member.profileID}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => alert(`Promote ${member.profileID}`)}>
                  Promote
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleRemove(member.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-4">No members in the server.</p>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageMembersModal;
