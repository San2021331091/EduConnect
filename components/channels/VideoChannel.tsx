"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Phone } from "lucide-react";
import { User } from "@/app/model/user/user";
import { fetchUser } from "@/app/utils/fetchUser";




const VideoChannel = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const loadUser = async () => {
      const u = await fetchUser();
      setUser(u);
    };
    loadUser();
  }, []);

  /* ================= CAMERA ================= */
  const toggleCamera = async () => {
    if (!isCameraOn) {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(mediaStream);
      setIsCameraOn(true);
      setTimerActive(true);
    } else {
      stream?.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
      setTimerActive(false);
      setCallDuration(0);
    }
  };

  /* ================= MICROPHONE ================= */
  const toggleMic = () => {
    if (!stream) return;

    stream.getAudioTracks().forEach(track => {
      track.enabled = !isMicOn;
    });

    setIsMicOn(prev => !prev);
  };

  /* ================= ATTACH STREAM ================= */
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!timerActive) return;

    timerRef.current = window.setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const displayName =
    user?.userID || "Unknown User";
   
  const initial =
    displayName.charAt(0).toUpperCase();

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-white relative">
      {/* ================= VIDEO CONTAINER ================= */}
      <div className="relative w-180 max-w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
        {isCameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-5xl font-semibold">
            {initial}
          </div>
        )}
      </div>

      {/* ================= USER INFO ================= */}
      <div className="mt-4 text-center">
        <p className="font-semibold text-lg">{displayName}</p>
        {timerActive && (
          <p className="text-sm text-gray-400">
            {String(Math.floor(callDuration / 60)).padStart(2, "0")}:
            {String(callDuration % 60).padStart(2, "0")}
          </p>
        )}
      </div>

      {/* ================= CONTROLS ================= */}
      <div className="absolute bottom-6 flex gap-6">
        <Button size="icon" onClick={toggleMic}>
          {isMicOn ? <Mic /> : <MicOff />}
        </Button>

        <Button size="icon" onClick={toggleCamera}>
          {isCameraOn ? <Video /> : <VideoOff />}
        </Button>

        <Button
          size="icon"
          variant="destructive"
          onClick={() => {
            stream?.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsCameraOn(false);
            setIsMicOn(false);
            setCallDuration(0);
            setTimerActive(false);
          }}
        >
          <Phone />
        </Button>
      </div>
    </div>
  );
};

export default VideoChannel;
