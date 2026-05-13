import {createContext, useContext} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {useWebRTC, WebRTCInstance} from '../hooks/useWebRTC';

const WebRTCContext = createContext<WebRTCInstance | null>(null);

export const WebRTCProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const user = useSelector((state: RootState) => state.user.user);
  const webrtc = useWebRTC(user?._id ?? '');

  return <WebRTCContext.Provider value={user?._id ? webrtc : null}>{children}</WebRTCContext.Provider>;
};

export const useWebRTCContext = (): WebRTCInstance | null => {
  return useContext(WebRTCContext);
};
