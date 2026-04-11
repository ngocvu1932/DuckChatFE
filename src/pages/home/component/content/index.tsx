import React, {useEffect, useRef, useState} from 'react';
import {EChatType, IChatSelected} from '../../../../components/chat';
import Avatar from '../../../../components/avatar';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faCircleInfo,
  faFaceKissWinkHeart,
  faGift,
  faImage,
  faPhone,
  faPlus,
  faThumbsUp,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import TextInput from '../../../../components/text-input';
import Message from '../../../../components/message';
import {useSelector} from 'react-redux';
import socket from '../../../../socket/socket';

interface IContentProps {
  selectedChat: IChatSelected | undefined;
  isShowDetailChat?: boolean;
  setShowDetailChat?: (isShow: boolean) => void;
}

export interface IMessage {
  chatId: string;
  senderId: string;
  type: string;
  content: string;
  isSeen: string[];
  mediaUrl: string;
  createdAt: string;
}

const Content: React.FC<IContentProps> = ({selectedChat, isShowDetailChat, setShowDetailChat}) => {
  const user = useSelector((state: any) => state.user.user);
  const [messages, setMessage] = useState<IMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChat?.type === EChatType.BOT) {
      setShowDetailChat && setShowDetailChat(false);
    }

    setMessage([]);
  }, [selectedChat]);

  useEffect(() => {
    socket.emit('joinGroup', selectedChat?.chatId);

    return () => {
      socket.off('joinGroup');
    };
  }, [selectedChat]);

  useEffect(() => {
    // Nhận tin nhắn từ server
    socket.on('receiveMessage', (msg: any) => {
      console.log('msg', msg);
      setMessage((prevMessages) => [...prevMessages, msg.message]);
    });

    return () => {
      socket.off('receiveMessage'); // Cleanup tránh lỗi memory leak
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const handleSendMessage = (type: string) => {
    if (messageInput.trim() === '' && type === 'text') {
      return;
    }

    const newMessage: IMessage = {
      chatId: selectedChat?.chatId ?? '',
      senderId: user._id ?? '',
      type: 'text',
      content: type === 'emoji' ? '👍' : messageInput,
      isSeen: [],
      mediaUrl: '',
      createdAt: new Date().toISOString(),
    };
    socket.emit('sendMessage', {groupId: selectedChat?.chatId, message: newMessage}); // Gửi tin nhắn lên server
    setMessage((prevMessages) => [...prevMessages, newMessage]);
    setMessageInput('');
  };

  if (!selectedChat) {
    return <div className="flex w-full h-full items-center justify-center">Chưa có tin nhắn nào được chọn</div>;
  }

  return (
    <div className="flex w-full">
      <div
        className={`flex flex-col flex-1 bg-white w-full min-h-0 ${isShowDetailChat ? 'rounded-l-md' : 'rounded-md'} `}
      >
        <div className="flex justify-between border-b border-[#E0E0E0] w-full py-2 px-3">
          <div className="flex items-center">
            <Avatar src={selectedChat.chatUri} online size="50" />
            <div className="flex flex-col pl-2">
              <div className="text-[#1E88E5] font-semibold text-lg">
                {selectedChat.chatName == 'Chat_with_bot_admin_chat_with_vunn'
                  ? 'Siêu đẹp trai'
                  : selectedChat.chatName}
              </div>
              <div className="text-sm opacity-80">Đang hoạt động</div>
            </div>
          </div>

          <div className="flex items-center">
            {selectedChat.type === EChatType.BOT ? (
              ''
            ) : (
              <div className="flex gap-6">
                <div className="cursor-pointer text-[#1E88E5]">
                  <FontAwesomeIcon icon={faPhone} size="lg" />
                </div>
                <div className="cursor-pointer text-[#1E88E5]">
                  <FontAwesomeIcon icon={faVideo} size="lg" />
                </div>

                <div
                  className="cursor-pointer text-[#1E88E5]"
                  onClick={() => {
                    setShowDetailChat && setShowDetailChat(!isShowDetailChat);
                  }}
                >
                  <FontAwesomeIcon icon={faCircleInfo} size="lg" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 min-h-0 flex-col  overflow-y-auto">
          {messages.length <= 0 ? (
            <div className="flex w-full h-full items-center justify-center">Chưa có tin nhắn</div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={index} className="flex w-full">
                  <Message user={user} message={message} />
                </div>
              ))}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 pb-3.5 px-3">
          <div className="flex gap-5 items-center">
            <div className="cursor-pointer flex items-center justify-center p-1.5 rounded-full bg-gray-100 hover:bg-gray-200">
              <FontAwesomeIcon icon={faPlus} size="lg" />
            </div>
            <div className="cursor-pointer">
              <FontAwesomeIcon icon={faImage} size="lg" />
            </div>
            <div className="cursor-pointer">
              <FontAwesomeIcon icon={faGift} size="lg" />
            </div>
          </div>

          <div className="flex flex-1 pl-5">
            <TextInput
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage('text');
                }
              }}
              value={messageInput}
              changeText={(text) => setMessageInput(text)}
              placeholder="Aa"
              className="w-full"
              rounded="full"
              suffix={<FontAwesomeIcon icon={faFaceKissWinkHeart} color="black" />}
            />
          </div>

          <div className="flex pl-5 pr-2 text-[#1E88E5] cursor-pointer" onClick={() => handleSendMessage('emoji')}>
            <FontAwesomeIcon icon={faThumbsUp} size="lg" />
          </div>
        </div>
      </div>

      {isShowDetailChat && (
        <div className="flex flex-1 border-l border-[#E0E0E0] bg-white rounded-r-md max-w-[30%]">detail ở đây</div>
      )}
    </div>
  );
};

export default Content;
