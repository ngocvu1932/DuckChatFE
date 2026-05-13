import {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import socket from '../socket/socket';
import {RootState} from '../redux/store';
import {updateLastMessage} from '../redux/slices/chatSlice';
import {addMessage, updateReactMessage, updateRemoveReactMessage} from '../redux/slices/messageSlice';
import {IMessage, IResponseReactMessage} from '../api/message/interface';
import {clearIncomingCall, setCallWith, setInCall, setIncomingCall} from '../redux/slices/callSlice';
import {useWebRTCContext} from './webRTCProvider';

const SocketProvider = ({children}: {children: React.ReactNode}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);
  const webrtc = useWebRTCContext();
  const webrtcRef = useRef(webrtc);

  useEffect(() => {
    webrtcRef.current = webrtc;
  }, [webrtc]);

  useEffect(() => {
    if (!user || !webrtc) return console.log('chưa có user hoặc webrtc!');

    socket.connect();

    const handleConnect = () => {
      console.log('Socket connected:', socket.id);
      socket.emit('joinUser', user._id);
    };

    const handleReceiveMessage = (msg: IMessage) => {
      // cập nhật lại listChat và messages
      dispatch(updateLastMessage({chatId: msg.chatId, message: msg}));
      dispatch(addMessage(msg));
    };

    const handleReceiveReactMessage = (data: IResponseReactMessage) => {
      // cập nhật lại listChat theo react
      dispatch(
        updateReactMessage({
          chatId: data.chatId,
          messageId: data.messId,
          react: data.react,
          userId: data.userId,
        }),
      );
    };

    const handleReceiveRemoveReactMessage = (data: IResponseReactMessage) => {
      // cập nhật lại listChat theo react
      dispatch(
        updateRemoveReactMessage({
          chatId: data.chatId,
          messageId: data.messId,
          userId: data.userId,
        }),
      );
    };

    socket.on('connect', handleConnect);
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('receiveReactMessage', handleReceiveReactMessage);
    socket.on('receiveRemoveReactMessage', handleReceiveRemoveReactMessage);

    //call
    const handleIncomingCall = (data: {from: string; offer: RTCSessionDescriptionInit}) => {
      if (webrtcRef.current?.callStatus !== 'idle') {
        socket.emit('reject-call', {to: data.from});
        return;
      }

      dispatch(setIncomingCall(data));
    };

    const handleCallAnswered = async (data: {from: string; answer: RTCSessionDescriptionInit}) => {
      await webrtcRef.current?.handleAnswer(data.answer);
      dispatch(setCallWith(data.from));
      dispatch(setInCall(true));
    };

    const handleICECandidate = async (data: {candidate: RTCIceCandidateInit}) => {
      await webrtcRef.current?.handleICE(data.candidate);
    };

    const handleEndCall = () => {
      webrtcRef.current?.endCallSilently();
      dispatch(setInCall(false));
      dispatch(setCallWith(null));
      dispatch(clearIncomingCall());
    };

    const handleRejectCall = () => {
      webrtcRef.current?.endCallSilently();
      dispatch(setInCall(false));
      dispatch(setCallWith(null));
      dispatch(clearIncomingCall());
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-answered', handleCallAnswered);
    socket.on('ice-candidate', handleICECandidate);
    socket.on('end-call', handleEndCall);
    socket.on('call-rejected', handleRejectCall);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('receiveReactMessage', handleReceiveReactMessage);
      socket.off('receiveRemoveReactMessage', handleReceiveRemoveReactMessage);

      //call
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-answered', handleCallAnswered);
      socket.off('ice-candidate', handleICECandidate);
      socket.off('end-call', handleEndCall);
      socket.off('call-rejected', handleRejectCall);

      socket.disconnect();
    };
  }, [dispatch, user?._id]);

  return <>{children}</>;
};

export default SocketProvider;
