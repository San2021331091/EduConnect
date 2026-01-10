"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import axios from "axios";

interface DeleteChannelAlertProps {
  channelId: string;
  onDelete: () => void;
  onClose: () => void;
}

const DeleteChannelAlert: React.FC<DeleteChannelAlertProps> = ({
  channelId,
  onDelete,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Get JWT from localStorage
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No JWT token found");

      await axios.delete(
        `${process.env.NEXT_PUBLIC_FIBER_URL}/channels/${channelId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onDelete();
      onClose(); // close modal after delete
    } catch (err) {
      alert("Failed to delete channel");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-lg w-full">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription>
          This will permanently delete the channel.
        </AlertDialogDescription>

        <AlertDialogFooter>
          <Button className="bg-blue-500 text-white" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteChannelAlert;
