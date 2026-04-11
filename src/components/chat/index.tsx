import React from 'react';
import {IChat} from '../../api/chat/interface';
import {formatTime} from '../../utils/date';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEllipsis, faThumbtack} from '@fortawesome/free-solid-svg-icons';
import Avatar from '../avatar';

export enum EChatType {
  CHAT = 'Chat',
  BOT = 'Bot',
}

export interface IChatSelected {
  chatId: string;
  chatName: string;
  chatUri: string;
  online?: boolean;
  type?: EChatType;
}

interface IChatProps {
  user: any;
  type?: EChatType;
  chat: IChat | undefined;
  onSelected?: (chat: IChatSelected) => void;
  isChoose?: boolean;
}

const Chat: React.FC<IChatProps> = ({user, type = EChatType.CHAT, chat, onSelected, isChoose}) => {
  if (!chat) {
    return null;
  }

  if (chat.isHide || chat.isDelete) {
    return null;
  }

  const chatName =
    type === EChatType.BOT ? 'Siêu đẹp trai' : chat.user.find((userChat) => userChat._id !== user._id)?.fullname;

  const online =
    type === EChatType.BOT
      ? true
      : chat.isGroupChat
      ? false
      : chat.user.find((userChat) => userChat._id !== user._id)?.online;

  const avatar =
    chat.isGroupChat || type === EChatType.BOT
      ? chat.groupImgUri
      : chat.user.find((userChat) => userChat._id !== user._id)?.avatar;

  return (
    <div
      className={`flex justify-between shadow-sm rounded-xl mt-2 py-2 px-2 cursor-pointer group ${
        isChoose ? 'bg-[#90CAF9]' : ''
      } `}
      onClick={() => {
        onSelected &&
          !isChoose &&
          onSelected({chatId: chat._id, chatName: chatName ?? '', chatUri: avatar ?? '', online: online, type: type});
      }}
    >
      <div className="flex">
        <Avatar src={avatar ?? ''} size={'55'} online={online} />
      </div>

      <div className="flex flex-1 justify-between flex-col ml-2">
        <div className="line-clamp-1 text-[#333333]">{chatName}</div>
        <div className="text-xs">{chat.lastMessage.content ? chat.lastMessage.content : 'Chưa có'}</div>
      </div>

      <div className="flex flex-col justify-between items-end ">
        <div className="hidden group-hover:block">
          <FontAwesomeIcon icon={faEllipsis} />
        </div>
        <div className="group-hover:hidden text-xs">{formatTime(chat.lastMessage.timestamp)}</div>
        {!chat.isPin && <FontAwesomeIcon icon={faThumbtack} />}
      </div>
    </div>
  );
};

export default Chat;
