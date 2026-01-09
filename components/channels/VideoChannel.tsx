"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Phone } from "lucide-react";
import { Server } from "@/app/model/server/server";

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  muted: boolean;
}

interface VideoChannelProps {
  channelId: string;
  userId: string; // current logged-in user ID
  server: Server;
}

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "turn:numb.viagenie.ca", username: "webrtc@live.com", credential: "muazkh" },
];

const VideoChannel = ({ channelId, userId, server }: VideoChannelProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const pcsRef = useRef<{ [id: string]: RTCPeerConnection }>({});
  const wsRef = useRef<WebSocket | null>(null);

  /* ================= CAMERA + MICROPHONE ================= */
  const toggleCamera = async () => {
    if (!isCameraOn) {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      setIsCameraOn(true);
      setTimerActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      Object.values(pcsRef.current).forEach(pc =>
        mediaStream.getTracks().forEach(track => pc.addTrack(track, mediaStream))
      );
    } else {
      stream?.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
      setIsMicOn(true);
      setTimerActive(false);
      setCallDuration(0);
    }
  };

  const toggleMic = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach(track => (track.enabled = !isMicOn));
    setIsMicOn(prev => !prev);
  };

  /* ================= WEBRTC PEER CONNECTION ================= */
  const createPeerConnection = useCallback(
    (peerId: string) => {
      // Move getMemberName inside the useCallback to fix memoization warning
      const getMemberName = (id: string) => {
        const member = server.members.find((m) => m.profile?.userID === id);
        return member?.profile?.name || member?.role || "Unknown";
      };

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      if (stream) stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        setParticipants(prev => {
          const exists = prev.find(p => p.id === peerId);
          if (!exists) return [...prev, { id: peerId, name: getMemberName(peerId), stream: event.streams[0], muted: false }];
          exists.stream = event.streams[0];
          return [...prev];
        });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          wsRef.current?.send(
            JSON.stringify({ type: "ice", candidate: event.candidate, from: userId, to: peerId })
          );
        }
      };

      return pc;
    },
    [stream, userId, server]
  );

  /* ================= WEBSOCKET SIGNALING ================= */
  useEffect(() => {
    if (!channelId) return;

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_FIBER_WEBSOCKET_URL}/ws/video/${channelId}/${userId}`);
    wsRef.current = ws;

    ws.onopen = () => console.log("Connected to Video WS");

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      const { type, from, sdp, candidate } = data;
      if (from === userId) return;

      let pc = pcsRef.current[from];
      if (!pc) {
        pc = createPeerConnection(from);
        pcsRef.current[from] = pc;
      }

      if (type === "join") {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.send(JSON.stringify({ type: "offer", sdp: offer, from: userId, to: from }));
      }

      if (type === "offer") {
        if (pc.signalingState !== "stable") return;
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: "answer", sdp: answer, from: userId, to: from }));
      }

      if (type === "answer") {
        if (pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        }
      }

      if (type === "ice" && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    return () => {
      Object.values(pcsRef.current).forEach(pc => pc.close());
      pcsRef.current = {};
      ws.close();
    };
  }, [channelId, createPeerConnection, userId]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = window.setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-white relative">
      {timerActive && (
        <div className="absolute top-4 text-lg font-medium bg-black bg-opacity-50 px-4 py-1 rounded">
          Call Duration: {Math.floor(callDuration / 60).toString().padStart(2, "0")}:
          {(callDuration % 60).toString().padStart(2, "0")}
        </div>
      )}

      <video ref={videoRef} className="hidden" autoPlay muted playsInline />

      {participants.map((p) => (
        <div
          key={p.id}
          className="relative w-180 max-w-full aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg mt-2"
        >
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm font-semibold z-10">
            {p.name}
          </div>

          {p.stream ? (
            <video
              autoPlay
              playsInline
              ref={(el) => {
                if (el) el.srcObject = p.stream;
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700 text-4xl font-semibold">
              {p.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      ))}

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
            stream?.getTracks().forEach((track) => track.stop());
            setStream(null);
            setIsCameraOn(false);
            setIsMicOn(false);
            setCallDuration(0);
            setTimerActive(false);
            Object.values(pcsRef.current).forEach((pc) => pc.close());
            pcsRef.current = {};
            setParticipants([]);
            wsRef.current?.close();
          }}
        >
          <Phone />
        </Button>
      </div>
    </div>
  );
};

export default VideoChannel;
