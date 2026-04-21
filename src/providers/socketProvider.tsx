import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import socket from '../socket/socket';
import {RootState} from '../redux/store';
import {updateLastMessage} from '../redux/slices/chatSlice';
import {addMessage, updateReactMessage} from '../redux/slices/messageSlice';
import {IMessage, IResponseReactMessage} from '../api/message/interface';

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

    socket.on('connect', handleConnect);
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('receiveReactMessage', handleReceiveReactMessage);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('receiveReactMessage', handleReceiveReactMessage);

      socket.disconnect(); // optional
    };
  }, [user]);

  return <>{children}</>;
};

export default SocketProvider;
