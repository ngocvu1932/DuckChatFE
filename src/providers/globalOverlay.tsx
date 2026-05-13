import React, {useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
  faPhone,
  faPhoneSlash,
  faUser,
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';
import Avatar from '../components/avatar';
import {RootState} from '../redux/store';
import {clearIncomingCall, setCallWith, setInCall} from '../redux/slices/callSlice';
import {WebRTCInstance} from '../hooks/useWebRTC';
import {useWebRTCContext} from './webRTCProvider';
import socket from '../socket/socket';

type IncomingCall = {
  from: string;
  offer: RTCSessionDescriptionInit;
};

type CallPartner = {
  name: string;
  avatar: string;
  online?: boolean;
};

interface CallModalProps {
  partner?: CallPartner;
  webrtc: WebRTCInstance;
  onEndCall: () => void;
}

const controlButtonClass =
  'flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/20 active:scale-95';

const CallModal: React.FC<CallModalProps> = ({partner, webrtc, onEndCall}) => {
  const isWaitingForRemote = !webrtc.remoteStreamState;
  const statusText = webrtc.isConnected
    ? 'Dang trong cuoc goi'
    : webrtc.callStatus === 'calling'
      ? 'Dang goi...'
      : 'Dang ket noi...';

  useEffect(() => {
    if (webrtc.localVideoRef.current) {
      webrtc.localVideoRef.current.srcObject = webrtc.localStreamState;
    }
  }, [webrtc.localStreamState, webrtc.localVideoRef]);

  useEffect(() => {
    if (webrtc.remoteVideoRef.current) {
      webrtc.remoteVideoRef.current.srcObject = webrtc.remoteStreamState;
    }
  }, [webrtc.remoteStreamState, webrtc.remoteVideoRef]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-md">
      <div className="relative flex h-full max-h-[720px] w-full max-w-[980px] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 shadow-2xl shadow-slate-950/60">
        <div className="relative min-h-0 flex-1 bg-slate-900">
          <video
            ref={webrtc.remoteVideoRef}
            autoPlay
            playsInline
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              isWaitingForRemote ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {isWaitingForRemote && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.28),_transparent_34%),linear-gradient(145deg,_#0f172a,_#020617)] px-6 text-center">
              {partner?.avatar ? (
                <Avatar src={partner.avatar} online={partner.online} size="55" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500 text-2xl text-white shadow-lg shadow-sky-950/40">
                  <FontAwesomeIcon icon={faUser} />
                </div>
              )}
              <h2 className="mt-4 max-w-[80%] truncate text-2xl font-bold text-white">{partner?.name ?? 'DuckChat'}</h2>
              <p className="mt-2 text-sm font-medium text-slate-300">{statusText}</p>
              <div className="mt-6 flex items-end gap-1.5">
                {[0, 1, 2, 3].map((item) => (
                  <span
                    key={item}
                    className="h-7 w-1.5 rounded-full bg-sky-300/90"
                    style={{
                      animation: 'wave 900ms ease-in-out infinite',
                      animationDelay: `${item * 120}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-slate-950/80 to-transparent px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-white">{partner?.name ?? 'Cuoc goi video'}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-sky-200">{statusText}</p>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {webrtc.isConnected ? 'Live' : 'Video'}
              </div>
            </div>
          </div>

          <div className="absolute bottom-5 right-5 h-36 w-28 overflow-hidden rounded-2xl border border-white/20 bg-slate-800 shadow-xl shadow-slate-950/50 sm:h-44 sm:w-32">
            <video
              ref={webrtc.localVideoRef}
              autoPlay
              muted
              playsInline
              className={`h-full w-full object-cover ${webrtc.isCameraOn ? '' : 'opacity-0'}`}
            />
            {!webrtc.isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-white">
                <FontAwesomeIcon icon={faVideoSlash} />
              </div>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent px-5 pb-5 pt-16">
            {webrtc.error && <p className="mb-3 text-center text-sm font-semibold text-rose-200">{webrtc.error}</p>}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                title={webrtc.isMicOn ? 'Tat micro' : 'Bat micro'}
                className={`${controlButtonClass} ${webrtc.isMicOn ? 'bg-white/15 hover:bg-white/20' : 'bg-slate-700 hover:bg-slate-600'}`}
                onClick={webrtc.toggleMic}
              >
                <FontAwesomeIcon icon={webrtc.isMicOn ? faMicrophone : faMicrophoneSlash} />
              </button>
              <button
                type="button"
                title="Ket thuc cuoc goi"
                className={`${controlButtonClass} bg-rose-500 shadow-rose-950/40 hover:bg-rose-600`}
                onClick={onEndCall}
              >
                <FontAwesomeIcon icon={faPhoneSlash} />
              </button>
              <button
                type="button"
                title={webrtc.isCameraOn ? 'Tat camera' : 'Bat camera'}
                className={`${controlButtonClass} ${webrtc.isCameraOn ? 'bg-white/15 hover:bg-white/20' : 'bg-slate-700 hover:bg-slate-600'}`}
                onClick={webrtc.toggleCamera}
              >
                <FontAwesomeIcon icon={webrtc.isCameraOn ? faVideo : faVideoSlash} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface IncomingCallModalProps {
  incomingCall: IncomingCall;
  partner?: CallPartner;
  accept: () => void;
  reject: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({partner, accept, reject}) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-[28px] border border-white/70 bg-white p-5 text-center shadow-2xl shadow-slate-900/20">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-50">
          {partner?.avatar ? (
            <Avatar src={partner.avatar} online={partner.online} size="55" />
          ) : (
            <FontAwesomeIcon icon={faUser} className="text-2xl text-sky-600" />
          )}
        </div>
        <h2 className="mt-4 truncate text-xl font-bold text-slate-900">{partner?.name ?? 'Co nguoi dang goi'}</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">Cuoc goi video den</p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            title="Tu choi"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-100 transition hover:-translate-y-0.5 hover:bg-rose-600 active:scale-95"
            onClick={reject}
          >
            <FontAwesomeIcon icon={faPhoneSlash} />
          </button>
          <button
            type="button"
            title="Nhan cuoc goi"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-600 active:scale-95"
            onClick={accept}
          >
            <FontAwesomeIcon icon={faPhone} />
          </button>
        </div>
      </div>
    </div>
  );
};

const GlobalOverlay = () => {
  const webrtc = useWebRTCContext();
  const dispatch = useDispatch();
  const {incomingCall, inCall, callWith} = useSelector((state: RootState) => state.call);
  const chats = useSelector((state: RootState) => state.chat.chat);
  const currentUserId = useSelector((state: RootState) => state.user.user?._id);

  const partnerId = callWith ?? incomingCall?.from ?? null;
  const partner = useMemo(() => {
    const chat = chats.find((item) => item.user.some((chatUser) => chatUser._id === partnerId));
    const chatUser = chat?.user.find((item) => item._id !== currentUserId);

    if (!chatUser) return undefined;

    return {
      name: chatUser.fullname ?? 'DuckChat',
      avatar: chatUser.avatar ?? '',
      online: chatUser.online,
    };
  }, [callWith, chats, currentUserId, incomingCall?.from, partnerId]);

  if (!webrtc) return null;

  return (
    <>
      {incomingCall && (
        <IncomingCallModal
          incomingCall={incomingCall}
          partner={partner}
          accept={async () => {
            try {
              await webrtc.acceptCall(incomingCall.from, incomingCall.offer);
              dispatch(setCallWith(incomingCall.from));
              dispatch(setInCall(true));
              dispatch(clearIncomingCall());
            } catch (error) {
              console.error(error);
            }
          }}
          reject={() => {
            socket.emit('reject-call', {to: incomingCall.from});
            dispatch(clearIncomingCall());
          }}
        />
      )}

      {inCall && (
        <CallModal
          partner={partner}
          webrtc={webrtc}
          onEndCall={() => {
            webrtc.endCall();
            dispatch(setInCall(false));
            dispatch(setCallWith(null));
            dispatch(clearIncomingCall());
          }}
        />
      )}
    </>
  );
};

export default GlobalOverlay;
