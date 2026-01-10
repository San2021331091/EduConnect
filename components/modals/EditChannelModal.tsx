"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import axios from "axios";

interface EditChannelModalProps {
  channelId: string;
  initialName: string;
  onUpdate: (newName: string) => void;
  onClose: () => void; // parent closes modal
}

const EditChannelModal: React.FC<EditChannelModalProps> = ({
  channelId,
  initialName,
  onUpdate,
  onClose,
}) => {
  const [name, setName] = useState<string>(initialName);
  const [loading, setLoading] = useState<boolean>(false);

  // Reset input when modal opens for a new channel
  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Get JWT from localStorage
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No JWT token found");

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_FIBER_URL}/channels/${channelId}`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onUpdate(res.data.name);
      onClose(); // close modal
    } catch (err) {
      alert("Failed to update channel");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Edit Channel Name</DialogTitle>
        </DialogHeader>

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Channel Name"
          className="mb-4"
        />

        <DialogFooter>
          <Button className="bg-red-500 text-white" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-blue-700 text-white" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditChannelModal;
