import React, {useMemo} from 'react';
import {
  IMessage,
  IReactMessage,
  IRequestReactMessage,
  IRequestRemoveReactMessage,
  IResponseReactMessage,
} from '../../api/message/interface';
import {IUser} from '../../api/auth/interface';
import socket from '../../socket/socket';
import {useDispatch, useSelector} from 'react-redux';
import {updateReactMessage, updateRemoveReactMessage} from '../../redux/slices/messageSlice';
import {RootState} from '../../redux/store';
import Avatar from '../avatar';
import {listReact} from './data';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faX} from '@fortawesome/free-solid-svg-icons';
import {formatMessageDateTime, formatTimeHHMM} from '../../utils/date';

interface IMessageProps {
  message: IMessage;
  user?: IUser;
  receiverId: string;
  showTime?: boolean;
  showDateTime?: boolean;
}

interface IReactUI {
  userId: string;
  username: string;
  avatar: string;
  count: number;
  react: string;
}

const Message: React.FC<IMessageProps> = ({message, user, receiverId, showTime = false, showDateTime = false}) => {
  const isSender = message.senderId === (user?._id ?? '');
  const dispatch = useDispatch();
  const usersById = useSelector((state: RootState) => state.users.byId);

  const reactMessage = async (react: string) => {
    // bắn socket để react tin nhắn
    try {
      const newReact: IRequestReactMessage = {
        chatId: message.chatId,
        messId: message._id ?? '',
        react: react,
        userId: user?._id ?? '',
        receiverId: receiverId,
      };

      socket.emit('reactMessage', newReact, (res: IResponseReactMessage) => {
        dispatch(
          updateReactMessage({
            chatId: res.chatId,
            messageId: res.messId,
            react: res.react,
            userId: res.userId,
          }),
        );
      }); // Gửi tin nhắn lên server
    } catch (error) {
      console.log('error', error);
    }
  };

  const removeReactMessage = async () => {
    // bắn socket để remove react tin nhắn
    try {
      const reactRemove: IRequestRemoveReactMessage = {
        chatId: message.chatId,
        messId: message._id ?? '',
        userId: user?._id ?? '',
        receiverId: receiverId,
      };

      socket.emit('removeReactMessage', reactRemove, (res: IResponseReactMessage) => {
        dispatch(
          updateRemoveReactMessage({
            chatId: res.chatId,
            messageId: res.messId,
            userId: res.userId,
          }),
        );
      }); // Gửi tin nhắn lên server
    } catch (error) {
      console.log('error', error);
    }
  };

  const mapReactWithUser = (reacts: IReactMessage[], usersById: Record<string, IUser>, currentUser?: IUser) => {
    return reacts
      .map((r) => {
        const userId = r.user?.[0];

        const user = usersById[userId] || (currentUser && currentUser._id === userId ? currentUser : undefined);

        if (!user) return null;

        return {
          userId,
          username: user.username,
          avatar: user.avatar,
          count: r.count,
          react: r.react,
        };
      })
      .filter((item): item is IReactUI => item !== null);
  };

  const reactList = useMemo(() => {
    return mapReactWithUser(message?.react ?? [], usersById, user);
  }, [message.react, usersById, user]);

  const renderUserReact = () => {
    return (
      <>
        {reactList.map((value) => {
          return (
            <div
              key={`${value.userId}_${value.react}`}
              className="flex justify-between gap-2 items-center w-full whitespace-nowrap mb-1 px-2 py-1"
            >
              <div className="flex items-center gap-1">
                <Avatar src={value.avatar ?? ''} size="18" />
                <span className="leading-none">{value.username}</span>
              </div>

              <div className="flex items-center leading-none">
                <span>{value.react}</span>
                <span>x{value.count}</span>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="flex flex-col w-full">
      {showDateTime && (
        <div className="flex w-full  items-center justify-center mt-5">
          {formatMessageDateTime(message?.createdAt ?? '')}
        </div>
      )}
      <div className={`flex pb-1 w-full ${isSender ? 'justify-end pr-2' : 'justify-start pl-2'}`}>
        <div className="relative flex max-w-[70%]">
          <div className={`rounded-xl  flex w-full ${isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
            {/* 🔥 a: message (group riêng) */}
            <div className="group relative ">
              <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} py-1.5 px-3`}>
                <p>{message.content}</p>

                {showTime && <p className="text-xs italic pt-1">{formatTimeHHMM(message?.createdAt ?? '')}</p>}
              </div>

              {/* Y */}
              <div className={`absolute -bottom-7 ${isSender ? 'right-0' : 'left-0'} hidden group-hover:flex`}>
                <div className="flex bg-white gap-2.5 shadow px-2 py-1 rounded-xl z-40">
                  {listReact.map((value) => (
                    <button key={value.id} onClick={() => reactMessage(value.icon)}>
                      {value.icon}
                    </button>
                  ))}

                  <button
                    className="pl-2 "
                    onClick={() => {
                      removeReactMessage();
                    }}
                  >
                    <FontAwesomeIcon icon={faX} color="black" />
                  </button>
                </div>
              </div>
            </div>

            {/* 🔥 b: react list (group riêng) */}
            {message?.react && message?.react.length > 0 && (
              <div className={`absolute -bottom-4 ${isSender ? 'right-0' : 'left-0'} group`}>
                <div
                  className={`flex items-center bg-white gap-1 shadow px-1 rounded-xl ${
                    isSender ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {message.react.map((react, index) => (
                    <div key={index} className="flex items-center gap-1 text-sm">
                      {react.react}
                    </div>
                  ))}
                </div>

                {/* Z */}
                <div
                  className={`absolute ${isSender ? 'right-0' : 'left-0'} bottom-0 hidden group-hover:block bg-white text-black px-2 py-1 rounded w-max z-50 shadow-md`}
                >
                  {renderUserReact()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
