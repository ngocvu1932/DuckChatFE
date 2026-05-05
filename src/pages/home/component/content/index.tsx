import React, {useEffect, useRef, useState} from 'react';
import {EChatType, IChatSelected} from '../../../../components/chat';
import Avatar from '../../../../components/avatar';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faCircleInfo,
  faArrowLeft,
  faFaceKissWinkHeart,
  faGift,
  faImage,
  faPaperPlane,
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
import {RootState} from '../../../../redux/store';
import {updateLastMessage} from '../../../../redux/slices/chatSlice';
import {addMessage, addMessages, setMessages, updateMessage} from '../../../../redux/slices/messageSlice';
import InfiniteScroll from 'react-infinite-scroll-component';
import {IMessage} from '../../../../api/message/interface';
import messageAPIs from '../../../../api/message';
import moment from 'moment';

interface IContentProps {
  selectedChat: IChatSelected | undefined;
  isShowDetailChat?: boolean;
  setShowDetailChat?: (isShow: boolean) => void;
  onBackToList?: () => void;
}

const actionButtonClass =
  'flex h-10 w-10 items-center justify-center rounded-2xl text-sky-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 active:scale-95';

const Content: React.FC<IContentProps> = ({selectedChat, isShowDetailChat, setShowDetailChat, onBackToList}) => {
  const user = useSelector((state: RootState) => state.user.user);
  const messageByChat = useSelector((state: RootState) => state.message.messagesByChatId);
  const dispatch = useDispatch();
  const [messageInput, setMessageInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const messages = messageByChat[selectedChat?.chatId ?? ''] ?? [];

  useEffect(() => {
    if (selectedChat?.type === EChatType.BOT) {
      setShowDetailChat && setShowDetailChat(false);
    }
  }, [selectedChat]);

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

    const tempId = crypto.randomUUID();

    const newMessage: IMessage = {
      messageId: tempId,
      chatId: selectedChat?.chatId ?? '',
      senderId: user?._id ?? '',
      receiverId: selectedChat?.chatUserId ?? '',
      type: 'text',
      content: type === ETypeMessage.Emoji ? '\u{1F44D}' : messageInput,
      isSeen: [],
      mediaUrl: '',
      createdAt: new Date().toISOString(),
      status: 'sending',
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
    });

    setMessageInput('');

    dispatch(
      updateLastMessage({
        chatId: selectedChat?.chatId ?? '',
        message: newMessage,
      }),
    );
  };

  const getMessages = async (cursor?: string) => {
    if (!hasMore && cursor) return;
    try {
      const res = await messageAPIs.getMessages(selectedChat?.chatId ?? '', 20, cursor);

      if (res.success) {
        const newMessages = res.data;

        if (!cursor) {
          dispatch(
            setMessages({
              chatId: selectedChat?.chatId ?? '',
              messages: newMessages,
            }),
          );
        } else {
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
    }
  };

  const handleLoadMoreMessages = async () => {
    await getMessages(nextCursor ?? '');
  };

  if (!selectedChat) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <div className="mx-6 max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-2xl text-sky-600 shadow-sm">
            <FontAwesomeIcon icon={faThumbsUp} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Chon mot cuoc tro chuyen</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Tin nhan, tep dinh kem va thong tin lien he se hien thi tai day.
          </p>
        </div>
      </div>
    );
  }

  const canSendText = messageInput.trim().length > 0;

  return (
    <div className="flex min-h-0 w-full bg-white">
      <div className={`flex min-w-0 flex-1 flex-col ${isShowDetailChat ? 'rounded-bl-3xl' : 'rounded-b-3xl'}`}>
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" title="Quay lai" className={`${actionButtonClass} md:hidden`} onClick={onBackToList}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <Avatar src={selectedChat.chatUri} online={selectedChat.online} size="50" />
            <div className="min-w-0">
              <div className="truncate text-base font-bold text-slate-900 sm:text-lg">{selectedChat.chatName}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Dang hoat dong
              </div>
            </div>
          </div>

          {selectedChat.type !== EChatType.BOT && (
            <div className="flex items-center gap-1 sm:gap-2">
              <button type="button" title="Goi thoai" className={actionButtonClass}>
                <FontAwesomeIcon icon={faPhone} />
              </button>
              <button type="button" title="Goi video" className={actionButtonClass}>
                <FontAwesomeIcon icon={faVideo} />
              </button>
              <button
                type="button"
                title="Thong tin"
                className={`${actionButtonClass} ${isShowDetailChat ? 'bg-sky-50 text-sky-700' : ''}`}
                onClick={() => {
                  setShowDetailChat && setShowDetailChat(!isShowDetailChat);
                }}
              >
                <FontAwesomeIcon icon={faCircleInfo} />
              </button>
            </div>
          )}
        </div>

        <div
          id="scrollableDiv"
          ref={scrollRef}
          className="min-h-0 flex flex-1 flex-col-reverse overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-2 py-4 sm:px-4"
        >
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm font-medium text-slate-400">
              Chua co tin nhan
            </div>
          ) : (
            <InfiniteScroll
              dataLength={messages.length}
              next={handleLoadMoreMessages}
              hasMore={hasMore}
              inverse={true}
              loader={<h4 className="py-3 text-center text-xs font-semibold text-slate-400">Loading...</h4>}
              scrollableTarget="scrollableDiv"
              className="flex flex-col-reverse gap-1"
            >
              <>
                {messages.map((message, index) => {
                  const isLastMessage = index === 0;
                  const hasReact = message?.react && message.react.length > 0;
                  const paddingClass = isLastMessage ? 'pb-8' : hasReact ? 'pb-4' : '';
                  const nextMessage = messages[index - 1];
                  const aboveMessage = messages[index + 1];
                  const showTime = !nextMessage || nextMessage.senderId !== message.senderId;
                  const showDateTime =
                    !aboveMessage || !moment(aboveMessage.createdAt).isSame(moment(message.createdAt), 'day');

                  return (
                    <div key={index} className={`flex w-full ${paddingClass}`}>
                      <Message
                        showTime={showTime}
                        showDateTime={showDateTime}
                        user={user}
                        message={message}
                        receiverId={selectedChat?.chatUserId ?? ''}
                      />
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            </InfiniteScroll>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-slate-200/80 bg-white/95 px-3 py-3 backdrop-blur sm:gap-3 sm:px-5">
          <div className="flex items-center gap-1">
            <button type="button" title="Them" className={actionButtonClass}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button type="button" title="Anh" className={actionButtonClass}>
              <FontAwesomeIcon icon={faImage} />
            </button>
            <button type="button" title="Qua tang" className={`${actionButtonClass} hidden sm:flex`}>
              <FontAwesomeIcon icon={faGift} />
            </button>
          </div>

          <TextInput
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(ETypeMessage.Text);
              }
            }}
            value={messageInput}
            changeText={(text) => setMessageInput(text)}
            placeholder="Nhap noi dung tin nhan..."
            className="h-12 min-w-0 flex-1"
            rounded="full"
            suffix={<FontAwesomeIcon icon={faFaceKissWinkHeart} />}
          />

          <button
            type="button"
            title={canSendText ? 'Gui tin nhan' : 'Gui cam xuc'}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-100 active:scale-95 ${
              canSendText
                ? 'bg-sky-500 shadow-sky-200 hover:bg-sky-600'
                : 'bg-indigo-500 shadow-indigo-200 hover:bg-indigo-600'
            }`}
            onClick={() => handleSendMessage(canSendText ? ETypeMessage.Text : ETypeMessage.Emoji)}
          >
            <FontAwesomeIcon icon={canSendText ? faPaperPlane : faThumbsUp} />
          </button>
        </div>
      </div>

      {isShowDetailChat && (
        <aside className="hidden w-[300px] shrink-0 border-l border-slate-200/80 bg-slate-50/80 p-5 lg:block xl:w-[340px]">
          <div className="flex flex-col items-center text-center">
            <Avatar src={selectedChat.chatUri} online={selectedChat.online} size="55" />
            <h3 className="mt-3 max-w-full truncate text-lg font-bold text-slate-900">{selectedChat.chatName}</h3>
            <p className="mt-1 text-sm font-medium text-emerald-600">Dang hoat dong</p>
          </div>

          <div className="mt-6 space-y-3">
            <button className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700">
              Thong tin cuoc tro chuyen
              <FontAwesomeIcon icon={faCircleInfo} className="text-sky-500" />
            </button>
            <button className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700">
              Anh va tep da chia se
              <FontAwesomeIcon icon={faImage} className="text-sky-500" />
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Content;
