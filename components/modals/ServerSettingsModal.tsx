'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  serverName: string;
  onUpdate?: (newName: string) => void;
}

const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({
  isOpen,
  onClose,
  serverId,
  serverName,
  onUpdate,
}) => {
  const [name, setName] = useState(serverName);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ FIX: keep input in sync with latest server name
  useEffect(() => {
    if (isOpen) {
      setName(serverName);
    }
  }, [serverName, isOpen]);

  const handleSave = async () => {
    if (!name.trim() || name === serverName) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('Not authenticated');

      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_FIBER_URL}/servers/${serverId}`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ update parent state
      onUpdate?.(data.name);

      onClose();
    } catch (err) {
      console.error('Failed to update server:', err);
      alert('Failed to update server name.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Server Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-sm font-medium">Server Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Server Name"
              disabled={isSaving}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button
            className="bg-green-600! text-white!"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            className="bg-blue-600! text-white"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServerSettingsModal;
