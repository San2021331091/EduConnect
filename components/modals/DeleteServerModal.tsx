'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DeleteServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverName: string;
  onDelete: () => void;
}

const DeleteServerModal: React.FC<DeleteServerModalProps> = ({
  isOpen,
  onClose,
  serverName,
  onDelete
}) => {
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = () => {
    if (confirmText === serverName) {
      onDelete();
      setConfirmText('');
      onClose();
    } else {
      alert('Please type the server name exactly to confirm deletion.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Server</DialogTitle>
        </DialogHeader>

        <div className="mt-2 text-sm text-muted-foreground">
          <p>
            Are you sure you want to delete <strong>{serverName}</strong>? This action is irreversible.
          </p>
          <p className="mt-2">Type the server name to confirm:</p>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder="Type server name"
            className="mt-2 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete Server</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteServerModal;
