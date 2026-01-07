'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChannelType } from '@/app/model/channels/channels';


interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, type: ChannelType) => void;
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<ChannelType>(ChannelType.TEXT);

  const handleCreate = () => {
    if (!channelName.trim()) return;
    onCreate(channelName.trim(), channelType);
    setChannelName('');
    setChannelType(ChannelType.TEXT);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-sm font-medium">Channel Name</label>
            <Input
              placeholder="new channel"
              value={channelName}
              onChange={e => setChannelName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Channel Type</label>
            <RadioGroup
              value={channelType}
              onValueChange={value => setChannelType(value as ChannelType)}
              className="flex gap-4 mt-1"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="TEXT" id="text" />
                <label htmlFor="text" className="text-sm">Text Channel</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="AUDIO" id="audio" />
                <label htmlFor="audio" className="text-sm">Audio Channel</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="VIDEO" id="video" />
                <label htmlFor="video" className="text-sm">Video Channel</label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChannelModal;
