import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import socket from '../socket/socket';
import {RootState} from '../redux/store';
import {IMessage} from '../api/chat/interface';
import {updateLastMessage} from '../redux/slices/chatSlice';
import {addMessage} from '../redux/slices/messageSlice';

const SocketProvider = ({children}: {children: React.ReactNode}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    if (!user) return console.log('chưa có user!');

    socket.connect();

    const handleConnect = () => {
      console.log('Socket connected:', socket.id);
      socket.emit('joinUser', user._id);
    };

    const handleReceiveMessage = (msg: IMessage) => {
      console.log('Received message:', msg);
      // cập nhật lại listChat và messages
      dispatch(updateLastMessage({chatId: msg.chatId, message: msg}));
      dispatch(addMessage(msg));
    };

    socket.on('connect', handleConnect);
    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.disconnect(); // optional
    };
  }, [user]);

  return <>{children}</>;
};

export default SocketProvider;
