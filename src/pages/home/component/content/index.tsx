import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {IChatSelected} from '../../../../components/chat';
import Avatar from '../../../../components/avatar';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faCircleInfo,
  faArrowLeft,
  faFaceKissWinkHeart,
  faGift,
  faImage,
  faMicrophone,
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
import {IMessage} from '../../../../api/message/interface';
import messageAPIs from '../../../../api/message';
import moment from 'moment';
import {useAudioRecorder} from '../../../../hooks/useAudioRecorder';
import mediaAPIs from '../../../../api/media';
import EmojiPickerController, {EmojiPickerRef} from './components/emoji-picker';
import AudioRecorderModal from './components/audio-recorder-modal';
import ImageUploader from './components/image-uploader';

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
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isSendingImage, setIsSendingImage] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isPendingSendAudio, setIsPendingSendAudio] = useState(false);
  const [audioError, setAudioError] = useState('');
  const messages = messageByChat[selectedChat?.chatId ?? ''] ?? [];
  const displayedMessages = useMemo(() => [...messages].reverse(), [messages]);
  const isAtBottomRef = useRef(true);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const previousNewestMessageRef = useRef<{chatId: string; messageKey: string}>({
    chatId: '',
    messageKey: '',
  });
  const loadingMorePromiseRef = useRef<Promise<void> | null>(null);
  const pendingScrollRestoreRef = useRef<{scrollHeight: number; scrollTop: number} | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const {status, duration, audioBlob, startRecording, stopRecording, resetRecording} = useAudioRecorder();
  const messageInputRef = useRef<HTMLInputElement | null>(null);
  const pickerRef = useRef<EmojiPickerRef | null>(null);
  const [filesImage, setFilesImage] = useState<File[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!moreMenuRef.current?.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  useEffect(() => {
    stopRecording();
    setIsMoreMenuOpen(false);
    setIsRecorderOpen(false);
    setIsImagePickerOpen(false);
    setIsPendingSendAudio(false);
    setAudioError('');
    resetRecording();
  }, [selectedChat?.chatId]);

  useEffect(() => {
    if ((selectedChat?.chatId ?? '') != '') {
      loadingMorePromiseRef.current = null;
      getMessages();
    }
  }, [selectedChat?.chatId]);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    const chatId = selectedChat?.chatId ?? '';
    const newestMessage = messages[0];
    const newestMessageKey = newestMessage?._id ?? newestMessage?.messageId ?? '';
    const previousNewestMessage = previousNewestMessageRef.current;
    const isChangedChat = previousNewestMessage.chatId !== chatId;
    const isNewMessage = newestMessageKey !== '' && previousNewestMessage.messageKey !== newestMessageKey;
    const isOwnMessage = newestMessage?.senderId === user?._id;

    previousNewestMessageRef.current = {
      chatId,
      messageKey: newestMessageKey,
    };

    if (isChangedChat || (isNewMessage && (isOwnMessage || isAtBottomRef.current))) {
      scrollToBottom();
    }
  }, [messages, selectedChat?.chatId, user?._id]);

  useLayoutEffect(() => {
    const restoreState = pendingScrollRestoreRef.current;
    const el = scrollRef.current;

    if (!restoreState || !el) {
      return;
    }

    const scrollHeightDiff = el.scrollHeight - restoreState.scrollHeight;

    el.scrollTop = restoreState.scrollTop + scrollHeightDiff;
    pendingScrollRestoreRef.current = null;
  }, [messages.length]);

  const hasText = (str: string): boolean => {
    if (!str.trim()) return false;

    // loại bỏ emoji
    const textOnly = str.replace(/\p{Extended_Pictographic}/gu, '').trim();

    return textOnly.length > 0;
  };

  const sendMessage = (type: ETypeMessage, content: string, mediaUrl?: string[]) => {
    const tempId = crypto.randomUUID();

    const newMessage: IMessage = {
      messageId: tempId,
      chatId: selectedChat?.chatId ?? '',
      senderId: user?._id ?? '',
      receiverId: selectedChat?.chatUserId ?? '',
      type,
      content,
      isSeen: [],
      mediaUrl: mediaUrl ?? [],
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

    dispatch(
      updateLastMessage({
        chatId: selectedChat?.chatId ?? '',
        message: newMessage,
      }),
    );
  };

  const handleSendMessage = async (type: ETypeMessage) => {
    if (messageInput.trim() === '' && type === ETypeMessage.Text) {
      return;
    }

    const content = type === ETypeMessage.Text ? messageInput : '\u{1F44D}';
    const typeMessage = hasText(content) ? ETypeMessage.Text : ETypeMessage.Emoji;

    sendMessage(typeMessage, content);
    setMessageInput('');
  };

  const handleOpenRecorder = async () => {
    setIsMoreMenuOpen(false);
    setAudioError('');
    setIsRecorderOpen(true);
    resetRecording();
    await startRecording();
  };

  const handleClickImage = () => {
    setIsMoreMenuOpen(false);
    setIsImagePickerOpen(true);
  };

  const handleCancelClickImage = () => {
    setIsImagePickerOpen(false);
  };

  const handleSendImage = async () => {
    // logic gửi ảnh sẽ được xử lý trong component ImageUploader, sau khi ảnh được upload thành công sẽ gọi onSend để gửi tin nhắn
    setIsSendingImage(true);

    try {
      const formData = new FormData();

      filesImage.forEach((file) => {
        formData.append('images', file);
      });

      const res = await mediaAPIs.uploadImages(formData);

      if (res.success) {
        // gửi tin nhắn với type là image và content trống, mediaUrl là array các url ảnh
        const imageUrls = res.data.urls;

        sendMessage(ETypeMessage.Image, '', imageUrls);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSendingImage(false);
      setIsImagePickerOpen(false);
    }
  };

  const handleCancelRecording = () => {
    if (status === 'recording') {
      stopRecording();
    }

    resetRecording();
    setIsPendingSendAudio(false);
    setAudioError('');
    setIsRecorderOpen(false);
  };

  const uploadAndSendAudio = async (blob: Blob) => {
    setIsUploadingAudio(true);
    setAudioError('');

    const formData = new FormData();
    formData.append('file', blob, `voice-${Date.now()}.webm`);

    try {
      const res = await mediaAPIs.uploadAudio(formData);

      if (res.success) {
        if (!res.data || !res.data.url) {
          setAudioError('Không tìm thấy link âm thanh từ máy chủ.');
          setIsPendingSendAudio(false);
          return;
        }

        sendMessage(ETypeMessage.Audio, res.data.url);
        resetRecording();
        setIsPendingSendAudio(false);
        setIsRecorderOpen(false);
      }
    } catch (error) {
      console.log(error);
      setIsPendingSendAudio(false);
      setAudioError('Gui ghi am that bai. Vui long thu lai.');
    } finally {
      setIsUploadingAudio(false);
    }
  };

  useEffect(() => {
    if (isPendingSendAudio && audioBlob && !isUploadingAudio) {
      uploadAndSendAudio(audioBlob);
    }
  }, [audioBlob, isPendingSendAudio, isUploadingAudio]);

  const handleSendAudio = async () => {
    if (isUploadingAudio) return;

    if (status === 'recording') {
      setIsPendingSendAudio(true);
      stopRecording();
      return;
    }

    if (audioBlob) {
      await uploadAndSendAudio(audioBlob);
    }
  };

  const getMessages = async (cursor?: string) => {
    if (cursor && !hasMore) return;

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
    if (!nextCursor) {
      setHasMore(false);
      return;
    }

    const el = scrollRef.current;

    if (el) {
      pendingScrollRestoreRef.current = {
        scrollHeight: el.scrollHeight,
        scrollTop: el.scrollTop,
      };
    }

    if (!loadingMorePromiseRef.current) {
      setIsLoadingMore(true);
      loadingMorePromiseRef.current = getMessages(nextCursor).finally(() => {
        loadingMorePromiseRef.current = null;
        setIsLoadingMore(false);
      });
    }

    await loadingMorePromiseRef.current;
  };

  if (!selectedChat) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <div className="mx-6 max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-2xl text-sky-600 shadow-sm">
            <FontAwesomeIcon icon={faThumbsUp} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Chọn một cuộc trò chuyện</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Tin nhắn, tệp đính kèm và thông tin liên hệ sẽ hiển thị tại đây.
          </p>
        </div>
      </div>
    );
  }

  const canSendText = messageInput.trim().length > 0;

  return (
    <div className="flex min-h-0 w-full bg-white">
      <div className={`relative flex min-w-0 flex-1 flex-col ${isShowDetailChat ? 'rounded-bl-3xl' : 'rounded-b-3xl'}`}>
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
                Đang hoạt động
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button type="button" title="Gọi thoại" className={actionButtonClass}>
              <FontAwesomeIcon icon={faPhone} />
            </button>
            <button type="button" title="Gọi video" className={actionButtonClass}>
              <FontAwesomeIcon icon={faVideo} />
            </button>
            <button
              type="button"
              title="Thông tin"
              className={`${actionButtonClass} ${isShowDetailChat ? 'bg-sky-50 text-sky-700' : ''}`}
              onClick={() => {
                if (setShowDetailChat) {
                  setShowDetailChat(!isShowDetailChat);
                }
              }}
            >
              <FontAwesomeIcon icon={faCircleInfo} />
            </button>
          </div>
        </div>

        <div
          id="scrollableDiv"
          ref={scrollRef}
          className="min-h-0 flex flex-1 flex-col overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-2 py-4 sm:px-4"
          onScroll={(event) => {
            const el = event.currentTarget;
            const distanceFromBottom = el.scrollHeight - el.clientHeight - el.scrollTop;

            isAtBottomRef.current = distanceFromBottom <= 80;

            if (el.scrollTop <= 80 && hasMore && !loadingMorePromiseRef.current) {
              handleLoadMoreMessages();
            }
          }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center text-sm font-medium text-slate-400">
              Chưa có tin nhắn
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {isLoadingMore && <h4 className="py-3 text-center text-xs font-semibold text-slate-400">Loading...</h4>}
              {displayedMessages.map((message, index) => {
                const isLastMessage = index === displayedMessages.length - 1;
                const hasReact = message?.react && message.react.length > 0;
                const paddingClass = isLastMessage ? 'pb-8' : hasReact ? 'pb-4' : '';
                const previousMessage = displayedMessages[index - 1];
                const nextMessage = displayedMessages[index + 1];
                const showTime = !nextMessage || nextMessage.senderId !== message.senderId;
                const showDateTime =
                  !previousMessage || !moment(previousMessage.createdAt).isSame(moment(message.createdAt), 'day');

                return (
                  <div key={message._id ?? message.messageId} className={`flex w-full ${paddingClass}`}>
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
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-slate-200/80 bg-white/95 px-3 py-3 backdrop-blur sm:gap-3 sm:px-5">
          <div className="flex items-center gap-1">
            <div ref={moreMenuRef} className="relative">
              <button
                type="button"
                title="Thêm"
                className={`${actionButtonClass} ${isMoreMenuOpen ? 'bg-sky-50 text-sky-700' : ''}`}
                onClick={() => setIsMoreMenuOpen((current) => !current)}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute bottom-12 left-0 z-50 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/80">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                    onClick={handleOpenRecorder}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                      <FontAwesomeIcon icon={faMicrophone} />
                    </span>
                    Ghi âm
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                    onClick={handleClickImage}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                      <FontAwesomeIcon icon={faImage} />
                    </span>
                    Gửi hình
                  </button>
                </div>
              )}
            </div>

            <button type="button" title="Quà tặng" className={`${actionButtonClass} hidden sm:flex`}>
              <FontAwesomeIcon icon={faGift} />
            </button>
          </div>

          <TextInput
            ref={messageInputRef}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(ETypeMessage.Text);
              }
            }}
            value={messageInput}
            changeText={(text) => setMessageInput(text)}
            placeholder="Nhập nội dung tin nhắn..."
            className="h-12 min-w-0 flex-1"
            rounded="full"
            suffix={
              <div className="px-2.5 py-1" onClick={() => pickerRef.current?.toggle()}>
                <FontAwesomeIcon icon={faFaceKissWinkHeart} />
              </div>
            }
          />

          <button
            type="button"
            title={canSendText ? 'Gửi tin nhắn' : 'Gửi cảm xúc'}
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

        {isImagePickerOpen && (
          <ImageUploader
            onChange={(files) => {
              setFilesImage(files);
            }}
            onCancel={handleCancelClickImage}
            onSend={handleSendImage}
            isSending={isSendingImage}
          />
        )}

        <EmojiPickerController
          ref={pickerRef}
          onSelectEmoji={(emoji) => {
            const input = messageInputRef.current;
            if (!input) return;

            const start = input.selectionStart ?? 0;
            const end = input.selectionEnd ?? 0;

            const newValue = messageInput.slice(0, start) + emoji + messageInput.slice(end);

            setMessageInput(newValue);

            requestAnimationFrame(() => {
              input.focus();
              const cursor = start + emoji.length;
              input.setSelectionRange(cursor, cursor);
            });
          }}
        />

        {isRecorderOpen && (
          <AudioRecorderModal
            status={status}
            duration={duration}
            audioBlob={audioBlob}
            audioError={audioError}
            isUploadingAudio={isUploadingAudio}
            isPendingSendAudio={isPendingSendAudio}
            onStopRecording={stopRecording}
            onCancel={handleCancelRecording}
            onSend={handleSendAudio}
          />
        )}
      </div>

      {isShowDetailChat && (
        <aside className="hidden w-[300px] shrink-0 border-l border-slate-200/80 bg-slate-50/80 p-5 lg:block xl:w-[340px]">
          <div className="flex flex-col items-center text-center">
            <Avatar src={selectedChat.chatUri} online={selectedChat.online} size="55" />
            <h3 className="mt-3 max-w-full truncate text-lg font-bold text-slate-900">{selectedChat.chatName}</h3>
            <p className="mt-1 text-sm font-medium text-emerald-600">Đang hoạt động</p>
          </div>

          <div className="mt-6 space-y-3">
            <button className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700">
              Thông tin cuộc trò chuyện
              <FontAwesomeIcon icon={faCircleInfo} className="text-sky-500" />
            </button>
            <button className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700">
              Ảnh và tệp đã chia sẻ
              <FontAwesomeIcon icon={faImage} className="text-sky-500" />
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Content;
