import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass, faMessage, faXmark} from '@fortawesome/free-solid-svg-icons';
import {useDispatch} from 'react-redux';
import authAPIs from '../../../../../api/auth';
import {IUser} from '../../../../../api/auth/interface';
import chatAPIs from '../../../../../api/chat';
import TextInput from '../../../../../components/text-input';
import {IChatSelected} from '../../../../../components/chat';
import {addChat} from '../../../../../redux/slices/chatSlice';
import Modal from '../../../../../components/modal';

interface IAddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onChatSelected?: (chat: IChatSelected) => void;
}

const AddFriendModal: React.FC<IAddFriendModalProps> = ({isOpen, onClose, currentUserId, onChatSelected}) => {
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<IUser[]>([]);
  const [searchedUser, setSearchedUser] = useState<IUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isCreatingChat, setIsCreatingChat] = useState<boolean>(false);
  const isSearchedCurrentUser = searchedUser?._id === currentUserId;

  const resetModalState = () => {
    setSearchValue('');
    setSearchedUser(null);
    setErrorMessage('');
    setIsSearching(false);
    setIsCreatingChat(false);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  const handleSearch = async () => {
    const keyword = searchValue.trim();

    if (!keyword) {
      setSearchedUser(null);
      setErrorMessage('Vui long nhap username de tim kiem.');
      return;
    }

    setIsSearching(true);
    setErrorMessage('');

    try {
      const response = await authAPIs.getUserByUsername(keyword);

      if (!response.success || !response.data) {
        setSearchedUser(null);
        setErrorMessage(response.message || 'Khong tim ra nguoi dung phu hop.');
        return;
      }

      const foundUser = response.data;

      setSearchedUser(foundUser);
      setSearchHistory((prev) => {
        const nextHistory = [foundUser, ...prev.filter((item) => item._id !== foundUser._id)];
        return nextHistory.slice(0, 5);
      });
    } catch (error: any) {
      setSearchedUser(null);
      setErrorMessage(error?.response?.data?.message || 'Khong tim ra nguoi dung phu hop.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClickMessage = async (user: IUser) => {
    if (!user?._id) {
      setErrorMessage('Khong co thong tin nguoi dung de tao cuoc tro chuyen.');
      return;
    }

    setIsCreatingChat(true);
    setErrorMessage('');

    try {
      const response = await chatAPIs.createChat({
        user: [user._id],
        chatName: '',
        isSeen: [],
        groupImgUri: '',
      });

      if (!response.success || !response.data) {
        setErrorMessage(response.message || 'Khong the tao hoac mo cuoc tro chuyen.');
        return;
      }

      const chat = response.data;
      const chatInfo = chat.user.find((userChat) => userChat._id !== currentUserId);
      const avatar = chat.isGroupChat ? chat.groupImgUri : (chatInfo?.avatar ?? '');

      if (!response.isExisting) {
        dispatch(addChat(chat));
      }

      onChatSelected?.({
        chatId: chat._id,
        chatUserId: chatInfo?._id ?? user._id,
        chatName: chatInfo?.fullname ?? user.fullname,
        chatUri: avatar || user.avatar || '',
        online: chatInfo?.online,
      });

      handleClose();
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Khong the tao hoac mo cuoc tro chuyen.');
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-xl p-0">
      <div className="overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Thêm bạn</h2>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={handleClose}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="space-y-5 px-5 py-4">
          {!searchedUser && (
            <>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Tìm theo tên người dùng</p>
                <TextInput
                  value={searchValue}
                  changeText={(value) => {
                    setSearchValue(value);
                    setErrorMessage('');
                  }}
                  placeholder="Nhập tên người cần tìm"
                  rounded="lg"
                  className="h-11 w-full"
                  prefix={<FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-slate-700">Lịch sử tìm</p>
                <div className="space-y-2">
                  {searchHistory.map((historyItem) => {
                    return (
                      <button
                        key={historyItem._id}
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-400 hover:bg-slate-50"
                        onClick={() => {
                          setSearchValue(historyItem.username);
                          setErrorMessage('');
                        }}
                      >
                        <div>
                          <p className="font-medium text-slate-800">{historyItem.fullname}</p>
                          <p className="text-sm text-slate-500">@{historyItem.username}</p>
                        </div>
                        <span className="text-xs text-slate-400">{historyItem.email || historyItem.address}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {searchedUser && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Kết quả tìm kiếm</p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">{searchedUser.fullname}</h3>
                  <p className="mt-1 text-sm text-slate-500">@{searchedUser.username}</p>
                  <p className="mt-3 text-sm text-slate-600">{searchedUser.email}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
                    {searchedUser.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </div>

                  {!isSearchedCurrentUser && (
                    <div
                      className={`flex w-full justify-center rounded-full bg-white py-2 font-medium text-slate-600 shadow-sm ${
                        isCreatingChat ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                      }`}
                      onClick={() => {
                        if (isCreatingChat) {
                          return;
                        }

                        handleClickMessage(searchedUser);
                      }}
                    >
                      <FontAwesomeIcon icon={faMessage} />
                    </div>
                  )}
                </div>
              </div>
              {searchedUser.address && <p className="mt-3 text-sm text-slate-500">{searchedUser.address}</p>}
            </div>
          )}

          {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            onClick={handleClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddFriendModal;
