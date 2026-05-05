import {useDispatch, useSelector} from 'react-redux';
import HeaderComp from './component/header';
import {useEffect, useState} from 'react';
import chatAPIs from '../../api/chat';
import Sidebar from './component/sidebar';
import Content from './component/content';
import {IChatSelected} from '../../components/chat';
import {setChat} from '../../redux/slices/chatSlice';
import {RootState} from '../../redux/store';
import LoginPage from '../login';
import {IChat} from '../../api/chat/interface';
import authAPIs from '../../api/auth';
import {IRequestGetUsersByIds} from '../../api/auth/interface';
import {addUsers} from '../../redux/slices/usersSlice';

const HomePage = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const listChat = useSelector((state: RootState) => state.chat.chat);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState({chat: true});
  const [selectedChat, setSelectedChat] = useState<IChatSelected | undefined>();
  const [isShowDetailChat, setIsShowDetailChat] = useState(false);

  useEffect(() => {
    getChat();
  }, []);

  const getChat = async () => {
    setLoading((prev) => ({...prev, chat: true}));
    try {
      const res = await chatAPIs.getChats();

      if (res.success == true) {
        const userIds = getOtherUserIds(res.data, user?._id ?? '');

        if (userIds.length > 0) {
          const body: IRequestGetUsersByIds = {
            userIds: userIds,
          };
          // fetch Users
          const resUsers = await authAPIs.getUsersByIds(body);

          if (resUsers.success == true) {
            dispatch(addUsers(resUsers.data));

            dispatch(setChat(res.data));
            setLoading((prev) => ({...prev, chat: false}));
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading((prev) => ({...prev, chat: false}));
    }
  };

  if (!user) {
    return <LoginPage />;
  }

  const getOtherUserIds = (chats: IChat[], currentUserId: string) => {
    const result = chats.flatMap((chat) => chat.user.map((u) => u._id).filter((id) => id !== currentUserId));

    // 👉 unique (nên có)
    return [...new Set(result)];
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 p-2 text-slate-900 sm:p-2 lg:p-3">
      <div className="flex h-16 shrink-0 rounded-t-3xl border border-white/70 bg-white/90 shadow-sm shadow-slate-200/70 backdrop-blur">
        <HeaderComp />
      </div>
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-b-3xl border-x border-b border-white/70 bg-white/80 shadow-xl shadow-slate-200/70 backdrop-blur">
        <div
          className={`w-full border-r border-slate-200/80 bg-slate-50/90 md:flex md:w-[320px] xl:w-[360px] ${
            selectedChat ? 'hidden' : 'flex'
          }`}
        >
          <Sidebar
            user={user}
            isLoading={loading.chat}
            chatData={listChat ?? []}
            chatSelected={(chat: IChatSelected) => setSelectedChat(chat)}
          />
        </div>
        <div className={`${selectedChat ? 'flex' : 'hidden'} min-w-0 flex-1 md:flex`}>
          <Content
            selectedChat={selectedChat}
            isShowDetailChat={isShowDetailChat}
            setShowDetailChat={(value) => setIsShowDetailChat(value)}
            onBackToList={() => setSelectedChat(undefined)}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
