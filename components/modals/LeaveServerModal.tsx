'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { fetchUser } from '@/app/utils/fetchUser';
import { Member } from '@/app/model/member/member';

interface LeaveServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverName: string;
  serverMembers: Member[];
  onLeave?: (userID: string) => void; 
}

const LeaveServerModal: React.FC<LeaveServerModalProps> = ({
  isOpen,
  onClose,
  serverName,
  serverMembers,
  onLeave,
}) => {
  const [loading, setLoading] = useState(false);

  const handleLeave = async () => {
    try {
      setLoading(true);
      const user = await fetchUser();
      if (!user) return;

      // Find current user's member ID
      const member = serverMembers.find((m) => m.userID === user.userID);
      if (!member) return alert("You are not a member of this server.");

      const token = localStorage.getItem('jwt');
      await axios.delete(`${process.env.NEXT_PUBLIC_FIBER_URL}/members/${member.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update parent component state
      if (onLeave) onLeave(user.userID);

      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to leave the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Leave Server</DialogTitle>
        </DialogHeader>

        <div className="mt-2 text-sm text-muted-foreground">
          <p>
            Are you sure you want to leave <strong>{serverName}</strong>? You will lose access to all channels in this server.
          </p>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleLeave} disabled={loading}>
            {loading ? 'Leaving...' : 'Leave Server'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveServerModal;
