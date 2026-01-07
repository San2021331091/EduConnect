'use client';

import { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;        // server ID is required for the API call
  serverName: string;
  onUpdate?: (newName: string) => void; // callback to update parent state
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

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('Not authenticated');

      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_FIBER_URL}/servers/${serverId}`,
        { name }, // send only the updated name
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Optional: update parent state immediately
      if (onUpdate) onUpdate(data.name);

      onClose();
    } catch (err) {
      console.error('Failed to update server:', err);
      alert('Failed to update server name.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Server Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-sm font-medium">Server Name</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Server Name"
              disabled={isSaving}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServerSettingsModal;
