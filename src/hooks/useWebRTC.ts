import {useCallback, useMemo, useRef, useState} from 'react';
import socket from '../socket/socket';

export type CallStatus = 'idle' | 'calling' | 'connecting' | 'connected';

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
  endCallSilently: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  callStatus: CallStatus;
  isMicOn: boolean;
  isCameraOn: boolean;
  isConnected: boolean;
  error: string | null;
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
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetMedia = useCallback(() => {
    localStream.current?.getTracks().forEach((track) => track.stop());

    localStream.current = null;
    remoteStream.current = null;
    iceQueue.current = [];

    setLocalStreamState(null);
    setRemoteStreamState(null);
    setCallStatus('idle');
    setIsConnected(false);
    setIsMicOn(true);
    setIsCameraOn(true);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, []);

  const closePeer = useCallback(() => {
    pcRef.current?.getSenders().forEach((sender) => {
      sender.track?.stop();
    });
    pcRef.current?.close();
    pcRef.current = null;
  }, []);

  const endCallInternal = useCallback(
    (notifyPeer: boolean) => {
      if (notifyPeer && targetRef.current) {
        socket.emit('end-call', {to: targetRef.current});
      }

      closePeer();
      resetMedia();
      targetRef.current = null;
    },
    [closePeer, resetMedia],
  );

  const createPeer = useCallback(() => {
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

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (!stream) return;

      remoteStream.current = stream;
      setRemoteStreamState(stream);
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate || !targetRef.current) return;

      socket.emit('ice-candidate', {
        to: targetRef.current,
        candidate: event.candidate,
      });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setIsConnected(true);
        setCallStatus('connected');
        return;
      }

      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setError('Ket noi cuoc goi bi gian doan.');
        endCallInternal(true);
      }
    };

    return pc;
  }, [endCallInternal]);

  const initStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});

    localStream.current = stream;
    setLocalStreamState(stream);
    setIsMicOn(stream.getAudioTracks().some((track) => track.enabled));
    setIsCameraOn(stream.getVideoTracks().some((track) => track.enabled));

    return stream;
  }, []);

  const attachLocalTracks = useCallback((pc: RTCPeerConnection, stream: MediaStream) => {
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  }, []);

  const flushIceQueue = useCallback(async (pc: RTCPeerConnection) => {
    const queuedCandidates = [...iceQueue.current];
    iceQueue.current = [];

    for (const candidate of queuedCandidates) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  const callUser = useCallback(
    async (targetId: string) => {
      if (!userId || !targetId || callStatus !== 'idle') return;

      setError(null);
      setCallStatus('calling');
      targetRef.current = targetId;

      try {
        const pc = createPeer();
        pcRef.current = pc;

        const stream = await initStream();
        attachLocalTracks(pc, stream);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('call-user', {
          to: targetId,
          from: userId,
          offer,
        });
      } catch (err) {
        console.error(err);
        setError('Khong the bat dau cuoc goi. Hay kiem tra quyen camera va micro.');
        endCallInternal(false);
        throw err;
      }
    },
    [attachLocalTracks, callStatus, createPeer, endCallInternal, initStream, userId],
  );

  const acceptCall = useCallback(
    async (callerId: string, offer: RTCSessionDescriptionInit) => {
      if (!userId || !callerId || callStatus !== 'idle') return;

      setError(null);
      setCallStatus('connecting');
      targetRef.current = callerId;

      try {
        const pc = createPeer();
        pcRef.current = pc;

        const stream = await initStream();
        attachLocalTracks(pc, stream);

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushIceQueue(pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer-call', {
          to: callerId,
          from: userId,
          answer,
        });
      } catch (err) {
        console.error(err);
        setError('Khong the tham gia cuoc goi. Hay thu lai sau.');
        endCallInternal(true);
        throw err;
      }
    },
    [attachLocalTracks, callStatus, createPeer, endCallInternal, flushIceQueue, initStream, userId],
  );

  const handleAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit) => {
      const pc = pcRef.current;
      if (!pc || pc.signalingState === 'closed') return;

      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      await flushIceQueue(pc);
      setCallStatus('connecting');
    },
    [flushIceQueue],
  );

  const handleICE = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = pcRef.current;

    if (pc?.remoteDescription) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      return;
    }

    iceQueue.current.push(candidate);
  }, []);

  const endCall = useCallback(() => {
    endCallInternal(true);
  }, [endCallInternal]);

  const endCallSilently = useCallback(() => {
    endCallInternal(false);
  }, [endCallInternal]);

  const toggleMic = useCallback(() => {
    const audioTracks = localStream.current?.getAudioTracks() ?? [];
    const nextValue = !isMicOn;

    audioTracks.forEach((track) => {
      track.enabled = nextValue;
    });
    setIsMicOn(nextValue);
  }, [isMicOn]);

  const toggleCamera = useCallback(() => {
    const videoTracks = localStream.current?.getVideoTracks() ?? [];
    const nextValue = !isCameraOn;

    videoTracks.forEach((track) => {
      track.enabled = nextValue;
    });
    setIsCameraOn(nextValue);
  }, [isCameraOn]);

  return useMemo(
    () => ({
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
      endCallSilently,
      toggleMic,
      toggleCamera,
      callStatus,
      isMicOn,
      isCameraOn,
      isConnected,
      error,
    }),
    [
      acceptCall,
      callStatus,
      callUser,
      endCall,
      endCallSilently,
      error,
      handleAnswer,
      handleICE,
      isCameraOn,
      isConnected,
      isMicOn,
      localStreamState,
      remoteStreamState,
      toggleCamera,
      toggleMic,
    ],
  );
};
