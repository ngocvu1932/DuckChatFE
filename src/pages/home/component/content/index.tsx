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
import {addMessage, addMessages, setMessages, updateMessage} from '../../../../redux/slices/messageSlice';
import InfiniteScroll from 'react-infinite-scroll-component';

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
  const [messageInput, setMessageInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  // const [loading, setLoading] = useState(false);
  const messages = messageByChat[selectedChat?.chatId ?? ''] ?? [];

  useEffect(() => {
    if (selectedChat?.type === EChatType.BOT) {
      setShowDetailChat && setShowDetailChat(false);
    }
  }, [selectedChat]);

  // lấy danh sách tin nhắn
  useEffect(() => {
    if ((selectedChat?.chatId ?? '') != '') {
      getMessages();
    }
  }, [selectedChat?.chatId]);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

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

    // fallback nếu server không trả ACK
    // setTimeout(() => {
    //   dispatch(markFailed({chatId, messageId: tempId}));
    // }, 5000);
  };

  const getMessages = async (cursor?: string) => {
    // if (loading) return;
    if (!hasMore && cursor) return console.log('ở đây');
    try {
      // setLoading(true);

      const res = await chatAPIs.getMessages(selectedChat?.chatId ?? '', 20, cursor);

      if (res.success) {
        const newMessages = res.data;

        if (!cursor) {
          //load lần đầu → replace
          dispatch(
            setMessages({
              chatId: selectedChat?.chatId ?? '',
              messages: newMessages,
            }),
          );
        } else {
          //load thêm → append
          dispatch(
            addMessages({
              chatId: selectedChat?.chatId ?? '',
              messages: newMessages,
            }),
          );
        }

        setNextCursor(res.nextCursor);
        setHasMore(!!res.nextCursor);
      }
    } catch (error) {
      console.log(error);
    } finally {
      // setLoading(false);
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

        <div id="scrollableDiv" ref={scrollRef} className="min-h-0 overflow-y-auto flex flex-1 flex-col-reverse">
          {messages.length === 0 ? (
            //render riêng ngoài InfiniteScroll
            <div className="flex flex-1 items-center justify-center text-gray-400">Chưa có tin nhắn</div>
          ) : (
            <InfiniteScroll
              dataLength={messages.length}
              next={() => getMessages(nextCursor ?? '')}
              hasMore={hasMore}
              inverse={true}
              loader={<h4>Loading...</h4>}
              scrollableTarget="scrollableDiv"
              className="flex flex-col-reverse"
            >
              <>
                {messages.map((message, index) => (
                  <div key={index} className="flex w-full">
                    <Message user={user} message={message} />
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            </InfiniteScroll>
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
