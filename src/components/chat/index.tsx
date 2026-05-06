import React from 'react';
import {IChat, IUserChat} from '../../api/chat/interface';
import {formatTime} from '../../utils/date';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEllipsis, faThumbtack} from '@fortawesome/free-solid-svg-icons';
import Avatar from '../avatar';
import {ETypeMessage} from '../../types/enum';

export interface IChatSelected {
  chatId: string;
  chatUserId: string;
  chatName: string;
  chatUri: string;
  online?: boolean;
}

interface IChatProps {
  user: any;
  chat: IChat | undefined;
  onSelected?: (chat: IChatSelected) => void;
  isChoose?: boolean;
}

const Chat: React.FC<IChatProps> = ({user, chat, onSelected, isChoose}) => {
  if (!chat) {
    return null;
  }

  if (chat.isHide || chat.isDelete) {
    return null;
  }

  const chatInfo = chat.user.find((userChat: IUserChat) => userChat._id !== user._id);
  const online = chat.isGroupChat ? false : chat.user.find((userChat) => userChat._id !== user._id)?.online;
  const avatar = chat.isGroupChat ? chat.groupImgUri : chat.user.find((userChat) => userChat._id !== user._id)?.avatar;

  const renderLastMessage = () => {
    // if (!chat.lastMessage?.content) {
    //   return 'Chưa có tin nhắn';
    // }

    if (chat.lastMessage?.type === ETypeMessage.Text || chat.lastMessage?.type === ETypeMessage.Emoji) {
      return chat.lastMessage?.content;
    } else if (chat.lastMessage?.type === ETypeMessage.Image) {
      return 'Đã gửi ảnh';
    } else if (chat.lastMessage?.type === ETypeMessage.Audio) {
      return 'Đã gửi tin nhắn thoại';
    } else if (chat.lastMessage?.type === ETypeMessage.Video) {
      return 'Đã gửi video';
    } else if (chat.lastMessage?.type === '') {
      return 'Chưa có tin nhắn';
    } else {
      return 'Đã gửi một tệp tin';
    }
  };

  return (
    <button
      type="button"
      className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left outline-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-sky-100 active:scale-[0.99] ${
        isChoose
          ? 'border-sky-200 bg-white text-slate-900 shadow-lg shadow-sky-100/80'
          : 'border-transparent bg-transparent hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md hover:shadow-slate-200/70'
      }`}
      onClick={() => {
        onSelected &&
          !isChoose &&
          onSelected({
            chatId: chat._id,
            chatUserId: chatInfo?._id ?? '',
            chatName: chatInfo?.fullname ?? '',
            chatUri: avatar ?? '',
            online: online,
          });
      }}
    >
      <Avatar src={avatar ?? ''} size="50" online={online} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-bold text-slate-900">{chatInfo?.fullname}</p>
          <span className="shrink-0 text-[11px] font-medium text-slate-400">
            {formatTime(chat.lastMessage.timestamp)}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
          <span className="font-semibold text-slate-700">{chat.lastMessage.sender == user._id ? 'Bạn: ' : ''}</span>
          {renderLastMessage()}
        </p>
      </div>

      <div className="flex h-full flex-col items-end justify-between gap-2 text-slate-400">
        <span className="flex h-7 w-7 items-center justify-center rounded-full opacity-0 transition group-hover:bg-slate-100 group-hover:opacity-100">
          <FontAwesomeIcon icon={faEllipsis} />
        </span>
        {!chat.isPin && (
          <span className="text-[11px] text-sky-500">
            <FontAwesomeIcon icon={faThumbtack} />
          </span>
        )}
      </div>
    </button>
  );
};

export default Chat;
