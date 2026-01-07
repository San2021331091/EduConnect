'use client';

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";

interface AudioParticipant {
  id: string;
  name: string;
  muted?: boolean;
}

interface AudioChannelProps {
  participants?: AudioParticipant[];
}

const AudioChannel: React.FC<AudioChannelProps> = ({ participants = [] }) => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [localParticipants, setLocalParticipants] = useState<AudioParticipant[]>(participants);

  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<number | null>(null);

  /* ================= TOGGLE MICROPHONE ================= */
  const toggleMic = async () => {
    if (!isMicOn) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(mediaStream);
        if (audioRef.current) audioRef.current.srcObject = mediaStream;
        setIsMicOn(true);
      } catch (err) {
        console.error("Mic access denied", err);
      }
    } else {
      stream?.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsMicOn(false);
    }
  };

  /* ================= TOGGLE PARTICIPANT MUTE ================= */
  const toggleParticipantMute = (id: string) => {
    setLocalParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, muted: !p.muted } : p))
    );
  };

  /* ================= START / END CALL ================= */
  const startCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
    timerRef.current = window.setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    setIsMicOn(false);
  };

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(track => track.stop());
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stream]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-linear-to-br from-gray-900 via-gray-800 to-gray-950 text-white">
      {/* HEADER */}
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        <h2 className="text-lg font-semibold">🎤 Voice Channel</h2>
        <div className="flex items-center gap-2">
          {isCallActive && <span className="text-sm">{formatTime(callDuration)}</span>}
          <Button
            size="sm"
            variant={isMicOn ? "destructive" : "secondary"}
            onClick={toggleMic}
          >
            {isMicOn ? <Mic className="w-4 h-4 mr-1" /> : <MicOff className="w-4 h-4 mr-1" />}
            {isMicOn ? "Mic On" : "Mic Off"}
          </Button>
          {!isCallActive ? (
            <Button size="sm" variant="outline" onClick={startCall}>
              <Phone className="w-4 h-4 mr-1" /> Start Call
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={endCall}>
              <PhoneOff className="w-4 h-4 mr-1" /> End Call
            </Button>
          )}
        </div>
      </div>

      {/* PARTICIPANTS */}
      <ScrollArea className="flex-1 p-4 space-y-3">
        {localParticipants.length === 0 ? (
          <p className="text-sm text-gray-400">No one is in the channel yet 🎧</p>
        ) : (
          localParticipants.map(p => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-gray-800/50 transition"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{p.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{p.name}</span>
              </div>
              <Button
                size="icon"
                variant={p.muted ? "destructive" : "secondary"}
                onClick={() => toggleParticipantMute(p.id)}
              >
                {p.muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
          ))
        )}
      </ScrollArea>

      <audio ref={audioRef} className="hidden" autoPlay />
    </div>
  );
};

export default AudioChannel;
