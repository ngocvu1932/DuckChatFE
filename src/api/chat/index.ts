import axiosInstance from '../axiosConfig';
import {IChatResponse} from './interface';

class Chat {
  constructor() {}

  getChats(): Promise<IChatResponse> {
    return axiosInstance.get('/api/chat/get-chats');
  }
}

export const chatAPIs = new Chat();
export default chatAPIs;
