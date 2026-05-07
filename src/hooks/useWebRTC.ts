import {useRef, useState} from 'react';
import socket from '../socket/socket';

export interface WebRTCInstance {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  localStream: React.MutableRefObject<MediaStream | null>;
  remoteStream: React.MutableRefObject<MediaStream | null>;
  localStreamState: MediaStream | null;
  remoteStreamState: MediaStream | null;
  callUser: (targetId: string) => Promise<void>;
  acceptCall: (callerId: string, offer: RTCSessionDescriptionInit) => Promise<void>;
  handleAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  handleICE: (candidate: RTCIceCandidateInit) => Promise<void>;
  endCall: () => void;
  isConnected: boolean;
}

export const useWebRTC = (userId: string): WebRTCInstance => {
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const targetRef = useRef<string | null>(null);
  const iceQueue = useRef<RTCIceCandidateInit[]>([]);

  const [localStreamState, setLocalStreamState] = useState<MediaStream | null>(null);
  const [remoteStreamState, setRemoteStreamState] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const createPeer = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        {urls: 'stun:stun.l.google.com:19302'},
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
      ],
    });

    pc.ontrack = (e) => {
      const stream = e.streams[0];

      remoteStream.current = stream;
      setRemoteStreamState(stream); // 👈 trigger UI
    };

    pc.onicecandidate = (e) => {
      if (e.candidate && targetRef.current) {
        socket.emit('ice-candidate', {
          to: targetRef.current,
          candidate: e.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setIsConnected(true);
      }
    };

    return pc;
  };

  const initStream = async () => {
    console.log('🎬 initStream called');

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    console.log('✅ GOT STREAM', stream);

    localStream.current = stream;
    setLocalStreamState(stream); // 👈 trigger UI

    return stream;
  };

  // 📞 CALL
  const callUser = async (targetId: string) => {
    if (!userId) return;

    targetRef.current = targetId;

    const pc = createPeer();
    pcRef.current = pc;

    const stream = await initStream();
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit('call-user', {
      to: targetId,
      from: userId,
      offer,
    });
  };

  // ✅ ACCEPT
  const acceptCall = async (callerId: string, offer: RTCSessionDescriptionInit) => {
    if (!userId) return;

    targetRef.current = callerId;

    const pc = createPeer();
    pcRef.current = pc;

    const stream = await initStream();
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    // flush ICE queue
    for (const c of iceQueue.current) {
      await pc.addIceCandidate(new RTCIceCandidate(c));
    }
    iceQueue.current = [];

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit('answer-call', {
      to: callerId,
      from: userId,
      answer,
    });
  };

  // 🔁 ANSWER
  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
  };

  // ❄️ ICE
  const handleICE = async (candidate: RTCIceCandidateInit) => {
    if (pcRef.current?.remoteDescription) {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      iceQueue.current.push(candidate);
    }
  };

  // 📴 END
  const endCall = () => {
    // emit trước
    if (targetRef.current) {
      socket.emit('end-call', {
        to: targetRef.current,
      });
    }
    pcRef.current?.close();
    pcRef.current = null;

    localStream.current?.getTracks().forEach((t) => t.stop());

    localStream.current = null;
    remoteStream.current = null;

    setLocalStreamState(null);
    setRemoteStreamState(null);
    setIsConnected(false);

    // clear video UI
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  return {
    localVideoRef,
    remoteVideoRef,

    localStream,
    remoteStream,

    localStreamState,
    remoteStreamState,

    callUser,
    acceptCall,
    handleAnswer,
    handleICE,
    endCall,

    isConnected,
  };
};
