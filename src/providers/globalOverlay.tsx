import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import React, {useEffect} from 'react';
import {clearIncomingCall, setCallWith, setInCall} from '../redux/slices/callSlice';
import {useWebRTCContext} from './webRTCProvider';
import socket from '../socket/socket';

type StreamRef = React.MutableRefObject<MediaStream | null>;
type VideoRef = React.RefObject<HTMLVideoElement>;

export interface WebRTCInstance {
  localVideoRef: VideoRef;
  remoteVideoRef: VideoRef;
  localStream: StreamRef;
  remoteStream: StreamRef;
  callUser: (targetId: string) => Promise<void>;
  acceptCall: (callerId: string, offer: RTCSessionDescriptionInit) => Promise<void>;
  handleAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  handleICE: (candidate: RTCIceCandidateInit) => Promise<void>;
  endCall: () => void;
  isConnected: boolean;
}

interface CallModalProps {
  webrtc: WebRTCInstance;
  endCall: () => void;
}

const CallModal: React.FC<CallModalProps> = ({webrtc, endCall}) => {
  useEffect(() => {
    if (webrtc.localVideoRef.current && webrtc.localStream.current) {
      webrtc.localVideoRef.current.srcObject = webrtc.localStream.current;
    }
  }, [webrtc.localStream.current]);

  useEffect(() => {
    if (webrtc.remoteVideoRef.current && webrtc.remoteStream.current) {
      webrtc.remoteVideoRef.current.srcObject = webrtc.remoteStream.current;
    }
  }, [webrtc.remoteStream.current]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-[420px] h-[600px] bg-black rounded-2xl overflow-hidden shadow-2xl">
        {/* Remote video */}
        <video ref={webrtc.remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

        {/* Local video (góc nhỏ) */}
        <video
          ref={webrtc.localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-28 h-36 absolute bottom-4 right-4 rounded-lg border border-white shadow"
        />

        {/* Header */}
        <div className="absolute top-3 left-0 w-full text-center text-white font-medium">Đang gọi...</div>

        {/* Controls */}
        <div className="absolute bottom-4 w-full flex justify-center gap-4">
          <button className="bg-gray-700 text-white px-3 py-2 rounded-full">🎤</button>

          <button onClick={endCall} className="bg-red-500 text-white px-4 py-2 rounded-full">
            ❌
          </button>

          <button className="bg-gray-700 text-white px-3 py-2 rounded-full">📷</button>
        </div>
      </div>
    </div>
  );
};

type IncomingCall = {
  from: string;
  offer: RTCSessionDescriptionInit;
};

interface IncomingCallModalProps {
  incomingCall: IncomingCall;
  accept: () => void;
  reject: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({incomingCall, accept, reject}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded">
        <p>{incomingCall.from} đang gọi...</p>
        <button onClick={accept}>Accept</button>
        <button onClick={reject}>Reject</button>
      </div>
    </div>
  );
};
const GlobalOverlay = () => {
  const webrtc = useWebRTCContext();
  const dispatch = useDispatch();
  const {incomingCall, inCall} = useSelector((s: RootState) => s.call);

  if (!webrtc) return null; //chưa login thì bỏ qua

  return (
    <>
      {incomingCall && (
        <IncomingCallModal
          incomingCall={incomingCall}
          accept={() => {
            webrtc.acceptCall(incomingCall.from, incomingCall.offer);
          }}
          reject={() => {
            socket.emit('reject-call', {
              to: incomingCall.from,
            });
            webrtc.endCall();
            dispatch(clearIncomingCall()); // tắt popup
          }}
        />
      )}

      {inCall && (
        <CallModal
          webrtc={webrtc}
          endCall={() => {
            webrtc.endCall();
            dispatch(setInCall(false)); // đóng popup
            dispatch(setCallWith(null)); //reset luôn
          }}
        />
      )}
    </>
  );
};

export default GlobalOverlay;
