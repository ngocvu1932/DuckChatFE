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
import AudioMessage from '../audio-message';
import {useReactionBurst} from '../../hooks/useReactionBurst';
import {ETypeMessage} from '../../types/enum';

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

type BurstParticleStyle = React.CSSProperties & {
  '--burst-x': string;
  '--burst-y': string;
  '--burst-rotate': string;
  '--burst-delay': string;
  '--burst-size': string;
};

interface IReactionButtonProps {
  icon: string;
  onReact: (react: string) => void;
}

const ReactionBurstButton: React.FC<IReactionButtonProps> = ({icon, onReact}) => {
  const {particles, popKey, triggerBurst} = useReactionBurst();

  const handleClick = () => {
    triggerBurst(icon);
    onReact(icon);
  };

  return (
    <button
      type="button"
      className="relative flex h-8 w-8 items-center justify-center overflow-visible rounded-xl transition hover:bg-slate-100 active:scale-95"
      onClick={handleClick}
      aria-label={`React with ${icon}`}
    >
      <span
        key={popKey}
        className="relative z-10 block will-change-transform [animation:reaction-pop_520ms_cubic-bezier(.2,.9,.2,1)]"
      >
        {icon}
      </span>

      <span
        key={`flash-${popKey}`}
        className="pointer-events-none absolute inset-0 rounded-xl bg-amber-200/35 opacity-0 [animation:reaction-flash_520ms_ease-out]"
      />

      <span className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-0 w-0">
        {particles.map((particle) => {
          const particleStyle: BurstParticleStyle = {
            '--burst-x': `${particle.x}px`,
            '--burst-y': `${particle.y}px`,
            '--burst-rotate': `${particle.rotation}deg`,
            '--burst-delay': `${particle.delay}ms`,
            '--burst-size': `${particle.size}px`,
          };

          return (
            <span
              key={particle.id}
              className="reaction-burst-particle absolute left-0 top-0 select-none leading-none will-change-transform"
              style={particleStyle}
            >
              {particle.icon}
            </span>
          );
        })}
      </span>
    </button>
  );
};

const Message: React.FC<IMessageProps> = ({message, user, receiverId, showTime = false, showDateTime = false}) => {
  const dispatch = useDispatch();
  const usersById = useSelector((state: RootState) => state.users.byId);
  const isSender = message.senderId === (user?._id ?? '');
  const audioSrc = message.content || message.mediaUrl;

  const reactMessage = async (react: string) => {
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
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  const removeReactMessage = async () => {
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
      });
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
              className="mb-1 flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-lg px-2 py-1"
            >
              <div className="flex items-center gap-2">
                <Avatar src={value.avatar ?? ''} size="18" />
                <span className="leading-none">{value.username}</span>
              </div>

              <div className="flex items-center gap-1 leading-none">
                <span>{value.react}</span>
                <span className="text-slate-500">x{value.count}</span>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  const renderContent = () => {
    switch (message.type) {
      case ETypeMessage.Text:
        return <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>;
      case ETypeMessage.Emoji:
        return <p className="whitespace-pre-wrap break-words text-2xl leading-6">{message.content}</p>;
      case ETypeMessage.Audio:
        return <AudioMessage src={audioSrc} isSender={isSender} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex w-full flex-col">
      {showDateTime && (
        <div className="my-5 flex w-full items-center justify-center">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-400 shadow-sm ring-1 ring-slate-200">
            {formatMessageDateTime(message?.createdAt ?? '')}
          </span>
        </div>
      )}
      <div className={`flex w-full pb-1 ${isSender ? 'justify-end pr-1 sm:pr-2' : 'justify-start pl-1 sm:pl-2'}`}>
        <div className="relative flex max-w-[82%] sm:max-w-[70%]">
          <div
            className={`relative flex w-full rounded-3xl shadow-sm transition-all duration-200 ${
              isSender
                ? 'rounded-br-lg bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-sky-100'
                : 'rounded-bl-lg bg-white text-slate-800 ring-1 ring-slate-200'
            }`}
          >
            <div className="group relative">
              <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} px-4 py-2.5`}>
                {renderContent()}

                {showTime && (
                  <p className={`pt-1 text-[11px] font-medium ${isSender ? 'text-white/75' : 'text-slate-400'}`}>
                    {formatTimeHHMM(message?.createdAt ?? '')}
                  </p>
                )}
              </div>

              <div className={`absolute -bottom-10 ${isSender ? 'right-0' : 'left-0'} z-40 hidden group-hover:flex`}>
                <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 text-base shadow-xl shadow-slate-200/80">
                  {listReact.map((value) => (
                    <ReactionBurstButton key={value.id} icon={value.icon} onReact={reactMessage} />
                  ))}

                  <button
                    type="button"
                    className="ml-1 flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-500 active:scale-95"
                    onClick={() => {
                      removeReactMessage();
                    }}
                  >
                    <FontAwesomeIcon icon={faX} />
                  </button>
                </div>
              </div>
            </div>

            {message?.react && message?.react.length > 0 && (
              <div className={`absolute -bottom-4 ${isSender ? 'right-2' : 'left-2'} group`}>
                <div
                  className={`flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-sm shadow-md ${
                    isSender ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {message.react.map((react, index) => (
                    <div key={index} className="flex items-center gap-1">
                      {react.react}
                    </div>
                  ))}
                </div>

                <div
                  className={`absolute ${isSender ? 'right-0' : 'left-0'} bottom-0 z-50 hidden w-max rounded-2xl border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800 shadow-xl group-hover:block`}
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
