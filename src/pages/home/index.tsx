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
        dispatch(setChat(res.data));
        setLoading((prev) => ({...prev, chat: false}));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex w-screen h-screen flex-col p-1 bg-white">
      <div className="flex h-[8vh] rounded-t-md border border-[#E0E0E0]">
        <HeaderComp />
      </div>
      <div className="flex h-[92vh] rounded-b-md border-x border-b border-[#E0E0E0]">
        <div className="flex w-[20%] border-r border-[#E0E0E0] bg-[#F7F7F7] rounded-es-md">
          <Sidebar
            user={user}
            isLoading={loading.chat}
            chatData={listChat ?? []}
            chatSelected={(chat: IChatSelected) => setSelectedChat(chat)}
          />
        </div>
        <div className="flex w-[80%]">
          <Content
            selectedChat={selectedChat}
            isShowDetailChat={isShowDetailChat}
            setShowDetailChat={(value) => setIsShowDetailChat(value)}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
