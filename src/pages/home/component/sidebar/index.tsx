import {useMemo, useState} from 'react';
import {IChat} from '../../../../api/chat/interface';
import Chat, {EChatType, IChatSelected} from '../../../../components/chat';
import LoadingSpinner from '../../../../components/loading-spinner';
import TextInput from '../../../../components/text-input';
import {IUser} from '../../../../api/auth/interface';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass, faUserPlus} from '@fortawesome/free-solid-svg-icons';
import AddFriendModal from './component/add-friend-modal';

interface ISidebarProps {
  user: IUser;
  chatData: IChat[];
  chatSelected?: (chat: IChatSelected) => void;
  isLoading?: boolean;
}

const Sidebar: React.FC<ISidebarProps> = ({user, chatData, chatSelected, isLoading = true}) => {
  const [selectedChat, setSelectedChat] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const chatDataUser = useMemo<IChat[]>(() => {
    return chatData.filter((chat) => chat.chatName !== 'Chat_with_bot_admin_chat_with_vunn');
  }, [chatData]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner size={50} color="sky" />
      </div>
    );
  }

  if (chatData.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 shadow-sm">
          <FontAwesomeIcon icon={faUserPlus} />
        </div>
        <h2 className="text-base font-semibold text-slate-800">Chua co tin nhan nao</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">Them ban be de bat dau cuoc tro chuyen dau tien.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-col">
      <div className="border-b border-slate-200/80 px-4 pb-4 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-500">Inbox</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Messages</h2>
          </div>
          <button
            type="button"
            title="Them ban"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 active:scale-95"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            <FontAwesomeIcon icon={faUserPlus} />
          </button>
        </div>
        <TextInput
          placeholder="Tim kiem cuoc tro chuyen"
          className="h-11 w-full"
          rounded="xl"
          prefix={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />}
        />
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {chatDataUser.map((chat) => {
          return (
            <Chat
              user={user}
              isChoose={chat._id === selectedChat ? true : false}
              key={chat._id}
              type={EChatType.CHAT}
              chat={chat}
              onSelected={(chat: IChatSelected) => {
                chatSelected && chatSelected(chat);
                setSelectedChat(chat.chatId);
              }}
            />
          );
        })}
      </div>

      <AddFriendModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentUserId={user._id}
        onChatSelected={(chat) => {
          chatSelected && chatSelected(chat);
          setSelectedChat(chat.chatId);
        }}
      />
    </div>
  );
};

export default Sidebar;
