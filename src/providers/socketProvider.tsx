import {useEffect} from 'react';
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
    const hanleIncomingCall = (data: {from: string; offer: RTCSessionDescriptionInit}) => {
      dispatch(setIncomingCall(data));
    };

    const handleCallAnswered = (data: {answer: RTCSessionDescriptionInit}) => {
      webrtc?.handleAnswer(data.answer);
    };

    const handleICECandidate = (data: {candidate: RTCIceCandidateInit}) => {
      webrtc?.handleICE(data.candidate);
    };

    const handleEndCall = () => {
      webrtc?.endCall();
      dispatch(setInCall(false));
      dispatch(setCallWith(null));
    };

    const handleRejectCall = () => {
      webrtc?.endCall();
      dispatch(setInCall(false));
      dispatch(setCallWith(null));
      dispatch(clearIncomingCall());
    };

    socket.on('incoming-call', hanleIncomingCall);
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
      socket.off('incoming-call', hanleIncomingCall);
      socket.off('call-answered', handleCallAnswered);
      socket.off('ice-candidate', handleICECandidate);
      socket.off('end-call', handleEndCall);
      socket.off('call-rejected', handleRejectCall);

      socket.disconnect(); // optional
    };
  }, [user]);

  return <>{children}</>;
};

export default SocketProvider;
