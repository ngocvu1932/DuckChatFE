import {useMemo, useState} from 'react';
import {IChat} from '../../../../api/chat/interface';
import Chat, {EChatType, IChatSelected} from '../../../../components/chat';
import LoadingSpinner from '../../../../components/loading-spinner';
import TextInput from '../../../../components/text-input';
import {IUser} from '../../../../api/auth/interface';

interface ISidebarProps {
  user: IUser;
  chatData: IChat[];
  chatSelected?: (chat: IChatSelected) => void;
  isLoading?: boolean;
}

const Sidebar: React.FC<ISidebarProps> = ({user, chatData, chatSelected, isLoading = true}) => {
  const [selectedChat, setSelectedChat] = useState<string>('');

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
      <TextInput placeholder="Tìm kiếm" className="mt-2" rounded="lg" />

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
  );
};

export default Sidebar;
