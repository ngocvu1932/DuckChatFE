import {useMemo, useState} from 'react';
import {IChat} from '../../../../api/chat/interface';
import Chat, {EChatType, IChatSelected} from '../../../../components/chat';
import LoadingSpinner from '../../../../components/loading-spinner';
import TextInput from '../../../../components/text-input';
import {IUser} from '../../../../api/auth/interface';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUserPlus} from '@fortawesome/free-solid-svg-icons';
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
    return <LoadingSpinner size={50} />;
  }

  if (chatData.length === 0) {
    return <div>Không có tin nhắn nào</div>;
  }

  return (
    <div className="flex flex-col w-full rounded-md mx-2">
      {/* searchbar */}
      <div className="flex w-full mt-2 ">
        <TextInput placeholder="Tìm kiếm" className="w-full" rounded="lg" />
        {/* group btn */}
        <div className="flex items-center ml-2">
          <button
            className="px-2"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            <FontAwesomeIcon icon={faUserPlus} />
          </button>
        </div>
      </div>

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
