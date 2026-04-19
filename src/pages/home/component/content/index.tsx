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
import {useDispatch, useSelector} from 'react-redux';
import socket from '../../../../socket/socket';
import {ETypeMessage} from '../../../../types/enum';
import chatAPIs from '../../../../api/chat';
import {IMessage, IRequestCreateMessgae} from '../../../../api/chat/interface';
import {RootState} from '../../../../redux/store';
import {updateLastMessage} from '../../../../redux/slices/chatSlice';
import {addMessage, setMessages, updateMessage} from '../../../../redux/slices/messageSlice';

interface IContentProps {
  selectedChat: IChatSelected | undefined;
  isShowDetailChat?: boolean;
  setShowDetailChat?: (isShow: boolean) => void;
}

const Content: React.FC<IContentProps> = ({selectedChat, isShowDetailChat, setShowDetailChat}) => {
  const user = useSelector((state: RootState) => state.user.user);
  const listChat = useSelector((state: RootState) => state.chat.chat);
  const messageByChat = useSelector((state: RootState) => state.message.messagesByChatId);
  const dispatch = useDispatch();
  const [messages, setMessage] = useState<IMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('mssg', messageByChat);

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

  // lấy danh sách tin nhắn
  useEffect(() => {
    getMessages();
  }, [selectedChat?.chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const handleSendMessage = async (type: ETypeMessage) => {
    if (messageInput.trim() === '' && type === ETypeMessage.Text) {
      return;
    }

    // id tin nhắn tạm
    const tempId = crypto.randomUUID();

    const newMessage: IMessage = {
      messageId: tempId,
      chatId: selectedChat?.chatId ?? '',
      senderId: user?._id ?? '',
      receiverId: selectedChat?.chatUserId ?? '',
      type: 'text',
      content: type === ETypeMessage.Emoji ? '👍' : messageInput,
      isSeen: [],
      mediaUrl: '',
      createdAt: new Date().toISOString(),
      status: 'sending', // trạng thái tin nhắn mới tạo
    };

    dispatch(addMessage(newMessage));

    socket.emit('sendMessage', newMessage, (res: IMessage) => {
      console.log('res Send:', res);

      dispatch(
        updateMessage({
          chatId: newMessage.chatId,
          messageId: tempId,
          newMessage: res,
        }),
      );
    }); // Gửi tin nhắn lên server

    setMessageInput('');

    //update last mess cho list chat
    dispatch(
      updateLastMessage({
        chatId: selectedChat?.chatId ?? '',
        message: newMessage,
      }),
    );

    // // gửi tin nhắn về service
    // await createMessage({
    //   chatId: newMessage.chatId,
    //   senderId: newMessage.senderId,
    //   type: newMessage.type,
    //   content: newMessage.content,
    //   isSeen: [],
    //   mediaUrl: newMessage.mediaUrl,
    // });

    // fallback nếu server không trả ACK
    // setTimeout(() => {
    //   dispatch(markFailed({chatId, messageId: tempId}));
    // }, 5000);
  };

  const createMessage = async (message: IRequestCreateMessgae) => {
    try {
      const res = await chatAPIs.createMessage(message);
      console.log('ress', res);
    } catch (error) {
      console.log(error);
    }
  };

  const getMessages = async () => {
    try {
      const res = await chatAPIs.getMessages(selectedChat?.chatId ?? '');
      if (res.success == true) {
        // setMessage(res.data);
        dispatch(setMessages({chatId: selectedChat?.chatId ?? '', messages: res.data}));
      }
    } catch (error) {
      console.log(error);
    }
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
          {messageByChat[selectedChat?.chatId ?? '']?.length <= 0 ? (
            <div className="flex w-full h-full items-center justify-center">Chưa có tin nhắn</div>
          ) : (
            <>
              {messageByChat[selectedChat?.chatId ?? '']?.map((message, index) => (
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
                  handleSendMessage(ETypeMessage.Text);
                }
              }}
              value={messageInput}
              changeText={(text) => setMessageInput(text)}
              placeholder="Nhập nội dung tin nhắn..."
              className="w-full"
              rounded="full"
              suffix={<FontAwesomeIcon icon={faFaceKissWinkHeart} color="black" />}
            />
          </div>

          <div
            className="flex pl-5 pr-2 text-[#1E88E5] cursor-pointer"
            onClick={() => handleSendMessage(ETypeMessage.Emoji)}
          >
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
