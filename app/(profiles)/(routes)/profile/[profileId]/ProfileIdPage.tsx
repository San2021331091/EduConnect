"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { User as UserIcon, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useParams, useRouter } from "next/navigation";
import { User } from "@/app/model/user/user";
import { CircularProgress } from "@/components/ui/circular-progress"; 
import { supabase } from "@/supabase/supabase-client";

const ProfileIdPage: React.FC = (): React.JSX.Element => {
  const { profileId } = useParams<{ profileId: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch profile
  useEffect(() => {
    if (!profileId) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_FIBER_URL}/profiles/${profileId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        setNotification({ type: "error", message: err.response?.status === 404 ? "Profile not found." : "Could not fetch profile." });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  // Save profile
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_FIBER_URL}/profiles/${profileId}`, profile, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });
      setProfile(res.data);
      setNotification({ type: "success", message: "Profile updated successfully!" });
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Could not update profile." });
    } finally {
      setSaving(false);
    }
  };

  // Delete profile
  const handleDelete = async () => {
    if (!profile) return;
    const confirmed = window.confirm("Are you sure you want to delete your profile? This cannot be undone.");
    if (!confirmed) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_FIBER_URL}/profiles/${profileId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });
      setNotification({ type: "success", message: "Profile deleted successfully!" });
      setTimeout(() => router.push("/sign-up"), 1500); // redirect after showing alert
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Could not delete profile." });
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setNotification({ type: "error", message: "Failed to logout: " + error.message });
      } else {
        setNotification({ type: "success", message: "Logged out successfully!" });
        setTimeout(() => router.push("/sign-in"), 1000);
      }
    } catch (err) {
      console.error(err);
      setNotification({ type: "error", message: "Failed to logout." });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <CircularProgress value={50} size={80} strokeWidth={8} />
      </div>
    );

  if (!profile) return <div className="text-center mt-10">Profile not found.</div>;

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Profile Card</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notification Alert */}
          {notification && (
            <Alert variant={notification.type === "success" ? "default" : "destructive"}>
              <AlertTitle>{notification.type === "success" ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          )}

          {/* Profile Avatar */}
          <div className="flex justify-center">
            {profile.imgURL ? (
              <Image
                src={profile.imgURL}
                alt="Profile Avatar"
                width={72}
                height={72}
                className="rounded-full border border-gray-300"
                unoptimized
              />
            ) : (
              <UserIcon className="w-24 h-24 text-gray-400 border border-gray-300 rounded-full p-2" />
            )}
          </div>

          {/* Name Input */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>

          {/* Email Input */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} disabled />
          </div>

          {/* Profile Image URL */}
          <div>
            <Label htmlFor="imgURL">Profile Image URL</Label>
            <Input
              id="imgURL"
              value={profile.imgURL || ""}
              onChange={(e) => setProfile({ ...profile, imgURL: e.target.value })}
              placeholder="Enter image URL"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-4">
            <Button className="flex-1 bg-green-500! text-white" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button className="flex-1" variant="destructive" onClick={handleDelete}>
              Delete Profile
            </Button>
            <Button className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileIdPage;
