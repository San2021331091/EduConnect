"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "../ui/alert";
import { User } from "@/app/model/user/user";
import { fetchServers } from "@/app/utils/fetchServers";

const formSchema = z.object({
  name: z.string().min(1, "Server name is required"),
  imageFile: z.any().refine((file) => file instanceof File, {
    message: "Server image is required",
  }),
});

interface InitialModalsProps {
  currentUser: User;
}

const InitialModals = ({
  currentUser,
}: InitialModalsProps): React.JSX.Element => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasServers, setHasServers] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageFile: undefined,
    },
  });

  const router = useRouter();
useEffect(() => {
  const checkServers = async () => {
    try {
      const servers = await fetchServers();
      if (!Array.isArray(servers)) {
        setHasServers(false);
        return;
      }

      const userHasServer = servers.some((server) =>
        server.members.some((member) => member.userID === currentUser.userID)
      );

      setHasServers(userHasServer);
    } catch (err) {
      console.error("Error checking servers:", err);
      setHasServers(false);
    }
  };

  checkServers();
}, [currentUser.userID]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!values.imageFile) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", values.imageFile);

      const imgbbRes = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!imgbbRes.data.success) throw new Error("upload failed");

      const imageUrl = imgbbRes.data.data.url;

      const serverRes = await axios.post(
        `${process.env.NEXT_PUBLIC_FIBER_URL}/servers`,
        {
          Name: values.name,
          ImageURL: imageUrl,
          ProfileID: currentUser.userID,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );

      if (serverRes.status !== 200 && serverRes.status !== 201) {
        throw new Error("Failed to create server");
      }

      <Alert className="border-green-500 text-green-400 bg-transparent">
        <AlertDescription>
          Your EduConnect Server has been created successfully.
        </AlertDescription>
      </Alert>;

      form.reset();
      setPreview(null);
      router.push(`/servers/${currentUser.userID}`);
    } catch (err: unknown) {
      console.error(err);
      alert("Error creating server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open>
      <DialogContent className="max-w-md bg-[#313338] text-[#F2F3F5] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-center text-2xl font-bold text-white">
            Customize your EduConnect server
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-[#B5BAC1] mt-2">
            Give your server a personality with a name and an image.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-6 space-y-6"
          >
            {/* IMAGE PICKER */}
            <FormField
              control={form.control}
              name="imageFile"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="sr-only">Server Image</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center">
                      <label className="relative cursor-pointer group">
                        <Avatar className="h-24 w-24 border-4 border-[#2B2D31] bg-[#1E1F22]">
                          <AvatarImage src={preview ?? undefined} />
                          <AvatarFallback className="text-xl text-[#5865F2]">
                            EC
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition">
                          <Upload className="h-6 w-6 text-white" />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            field.onChange(file);
                            setPreview(URL.createObjectURL(file));
                          }}
                        />
                      </label>
                      <p className="mt-2 text-xs text-[#B5BAC1]">
                        Upload Server Image
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SERVER NAME */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase text-[#B5BAC1] font-semibold">
                    Server Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="EduConnect Study Group"
                      disabled={isLoading}
                      className="
                        bg-[#1E1F22]
                        border border-[#2B2D31]
                        text-[#F2F3F5]
                        placeholder:text-[#6D6F78]
                        focus-visible:ring-[#5865F2]
                        focus-visible:ring-1
                        focus-visible:ring-offset-0
                      "
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* FOOTER */}
            <DialogFooter className="flex justify-between pb-6">
              {/* GO TO YOUR SERVERS BUTTON */}
              <Button
                type="button"
                variant="secondary"
                disabled={!hasServers}
                onClick={() =>
                  router.push(`/servers/${currentUser.userID}`)
                }
                className="bg-[#2B2D31] text-[#F2F3F5] hover:bg-[#3A3C41]"
              >
                Go to your servers
              </Button>

              {/* CREATE SERVER BUTTON */}
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold"
              >
                {isLoading ? "Creating..." : "Create Server"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InitialModals;
