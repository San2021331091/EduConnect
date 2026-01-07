'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import axios from 'axios';

interface DeleteServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverID: string;      // <-- send serverID to delete
  serverName: string;
  onDeleted?: () => void; // optional callback after deletion
}

const DeleteServerModal: React.FC<DeleteServerModalProps> = ({
  isOpen,
  onClose,
  serverID,
  serverName,
  onDeleted
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirmText !== serverName) {
      setAlertMessage('Please type the server name exactly to confirm deletion.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      await axios.delete(`${process.env.NEXT_PUBLIC_FIBER_URL}/servers/${serverID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlertMessage(`Server "${serverName}" deleted successfully.`);
      setConfirmText('');
      if (onDeleted) onDeleted();
      onClose();
    } catch (err) {
      console.error(err);
      setAlertMessage('Failed to delete server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Server</DialogTitle>
        </DialogHeader>

        {alertMessage && (
          <div className="mb-4 text-sm text-red-600">{alertMessage}</div>
        )}

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
            disabled={loading}
          />
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Server'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteServerModal;
