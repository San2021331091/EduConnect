'use client';

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { Server } from "@/app/model/server/server";

interface AudioParticipant {
  id: string;
  name: string;
  muted?: boolean;
  stream?: MediaStream;
}

interface AudioChannelProps {
  channelId: string;
  userId: string;
  server: Server;
}

// ✅ STUN + free TURN server
const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "turn:numb.viagenie.ca", username: "webrtc@live.com", credential: "muazkh" }
];

const AudioChannel: React.FC<AudioChannelProps> = ({ channelId, userId, server }) => {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<AudioParticipant[]>([]);
  const [callDuration, setCallDuration] = useState(0);

  const pcsRef = useRef<{ [id: string]: RTCPeerConnection }>({});
  const wsRef = useRef<WebSocket | null>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // ✅ Get member name from server members
  const getMemberName = (memberId: string) => {
    const member = server.members.find((m) => m.profile?.userID === memberId);
    return member?.profile?.name || member?.role || "Unknown";
  };

  /* ================= TOGGLE MICROPHONE ================= */
  const toggleMic = async () => {
    if (!isMicOn) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(mediaStream);
        setIsMicOn(true);

        if (localAudioRef.current) {
          localAudioRef.current.srcObject = mediaStream;
          localAudioRef.current.muted = true;
          await localAudioRef.current.play();
        }

        // Add track to all existing peers
        Object.values(pcsRef.current).forEach(pc => {
          mediaStream.getTracks().forEach(track => pc.addTrack(track, mediaStream));
        });
      } catch (err) {
        console.error("Mic access denied:", err);
      }
    } else {
      stream?.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsMicOn(false);
    }
  };

  /* ================= CREATE PEER CONNECTION ================= */
  const createPeerConnection = (peerId: string) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        wsRef.current?.send(JSON.stringify({
          type: "ice",
          candidate: event.candidate,
          from: userId,
          to: peerId
        }));
      }
    };

    pc.ontrack = (event) => {
      setParticipants(prev => {
        const exists = prev.find(p => p.id === peerId);
        if (!exists) {
          return [...prev, { id: peerId, name: getMemberName(peerId), stream: event.streams[0] }];
        } else {
          exists.stream = event.streams[0];
          return [...prev];
        }
      });
    };

    if (stream) {
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }

    return pc;
  };

  /* ================= HANDLE SIGNALING ================= */
  const handleWSMessage = async (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const { type, from, to, sdp, candidate, name } = data;

    if (from === userId) return;
    if (to && to !== userId) return;

    if (type === "join") {
      if (!pcsRef.current[from]) {
        const pc = createPeerConnection(from);
        pcsRef.current[from] = pc;

        setParticipants(prev => {
          if (!prev.find(p => p.id === from)) {
            return [...prev, { id: from, name: name || getMemberName(from) }];
          }
          return prev.map(p => {
            if (p.id === from) p.name = name || getMemberName(from);
            return p;
          });
        });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        wsRef.current?.send(JSON.stringify({
          type: "offer",
          sdp: offer,
          from: userId,
          to: from
        }));
      }
    }

    if (type === "offer") {
      const pc = createPeerConnection(from);
      pcsRef.current[from] = pc;

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      wsRef.current?.send(JSON.stringify({
        type: "answer",
        sdp: answer,
        from: userId,
        to: from
      }));

      setParticipants(prev => {
        if (!prev.find(p => p.id === from)) {
          return [...prev, { id: from, name: name || getMemberName(from) }];
        }
        return prev.map(p => {
          if (p.id === from) p.name = name || getMemberName(from);
          return p;
        });
      });
    }

    if (type === "answer") {
      const pc = pcsRef.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    }

    if (type === "ice") {
      const pc = pcsRef.current[from];
      if (pc && candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  /* ================= START CALL ================= */
  const startCall = () => {
    setIsCallActive(true);
    setCallDuration(0);

    wsRef.current = new WebSocket(`${process.env.NEXT_PUBLIC_FIBER_WEBSOCKET_URL}/ws/voice/${channelId}`);
    wsRef.current.onopen = () => {
      console.log("Connected to voice WebSocket");
      setParticipants([{ id: userId, name: getMemberName(userId) }]);

      wsRef.current?.send(JSON.stringify({
        type: "join",
        from: userId,
        name: getMemberName(userId)
      }));
    };

    wsRef.current.onmessage = handleWSMessage;

    timerRef.current = window.setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  /* ================= END CALL ================= */
  const endCall = () => {
    setIsCallActive(false);
    setCallDuration(0);

    Object.values(pcsRef.current).forEach(pc => pc.close());
    pcsRef.current = {};

    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    setIsMicOn(false);

    wsRef.current?.close();
    wsRef.current = null;

    setParticipants([]);
  };

  /* ================= MUTE / UNMUTE ================= */
  const toggleMuteParticipant = (id: string) => {
    setParticipants(prev =>
      prev.map(p => {
        if (p.id === id) p.muted = !p.muted;
        return p;
      })
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    return () => {
      Object.values(pcsRef.current).forEach(pc => pc.close());
      stream?.getTracks().forEach(track => track.stop());
      wsRef.current?.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stream]);

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white">
      {/* HEADER */}
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        <h2 className="text-lg font-semibold">🎤 Voice Channel</h2>
        <div className="flex items-center gap-2">
          {isCallActive && <span className="text-sm">{formatTime(callDuration)}</span>}
          <Button size="sm" variant={isMicOn ? "destructive" : "secondary"} onClick={toggleMic}>
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
        {participants.length === 0 ? (
          <p className="text-sm text-gray-400">No one is in the channel yet 🎧</p>
        ) : (
          participants.map(p => (
            <div key={p.id} className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-gray-800/50 transition">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{p.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{p.name}</span>

                {/* Render remote audio */}
                {p.stream && (
                  <audio
                    autoPlay
                    ref={el => {
                      if (el) {
                        el.srcObject = p.stream!;
                        el.muted = p.muted ?? false;
                      }
                    }}
                  />
                )}
              </div>
              <Button
                size="icon"
                variant={p.muted ? "destructive" : "secondary"}
                onClick={() => toggleMuteParticipant(p.id)}
              >
                {p.muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
          ))
        )}
      </ScrollArea>

      {/* Local audio */}
      <audio ref={localAudioRef} autoPlay className="hidden" />
    </div>
  );
};

export default AudioChannel;
