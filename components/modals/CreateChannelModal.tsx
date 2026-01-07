'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChannelType } from '@/app/model/channels/channels';
import axios from 'axios';
import { fetchUser } from '@/app/utils/fetchUser';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverID: string;
  onChannelCreated?: () => void; // optional callback to refresh channel list
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  serverID,
  onChannelCreated,
}) => {
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<ChannelType>(ChannelType.TEXT);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileID, setProfileID] = useState<string>('');

  // Load current user's profileID (userID from Supabase)
  useEffect(() => {
    const loadUser = async () => {
      const user = await fetchUser();
      if (user?.userID) setProfileID(user.userID);
    };
    loadUser();
  }, []);

  const handleCreate = async () => {
    if (!channelName.trim()) {
      setAlertMessage('Channel name cannot be empty.');
      return;
    }

    if (!profileID) {
      setAlertMessage('Cannot create channel: profileID missing.');
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem('jwt');

      await axios.post(
        `${process.env.NEXT_PUBLIC_FIBER_URL}/channels`,
        {
          name: channelName.trim(),
          type: channelType,
          serverID,
          profileID, // send userID as profileID
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAlertMessage(`Channel "${channelName}" created successfully!`);
      setChannelName('');
      setChannelType(ChannelType.TEXT);

      if (onChannelCreated) onChannelCreated();
    } catch (err) {
      console.error(err);
      setAlertMessage('Failed to create channel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>

        {/* Alert */}
        {alertMessage && (
          <Alert className="mb-4">
            <AlertTitle>{alertMessage.includes('Failed') ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-sm font-medium">Channel Name</label>
            <Input
              placeholder="new channel"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Channel Type</label>
            <RadioGroup
              value={channelType}
              onValueChange={(value) => setChannelType(value as ChannelType)}
              className="flex gap-4 mt-1"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="TEXT" id="text" />
                <label htmlFor="text" className="text-sm">
                  Text Channel
                </label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="AUDIO" id="audio" />
                <label htmlFor="audio" className="text-sm">
                  Audio Channel
                </label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="VIDEO" id="video" />
                <label htmlFor="video" className="text-sm">
                  Video Channel
                </label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="destructive" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button className="bg-blue-600 text-white" onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelModal;
