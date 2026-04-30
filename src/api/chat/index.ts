import axiosInstance from '../axiosConfig';
import {IChatResponse, ICreateChatRequest, ICreateChatResponse} from './interface';

class Chat {
  constructor() {}

  getChats(): Promise<IChatResponse> {
    return axiosInstance.get('/api/chat/get-chats');
  }

  createChat(body: ICreateChatRequest): Promise<ICreateChatResponse> {
    return axiosInstance.post('/api/chat/create-chat', body);
  }
}

export const chatAPIs = new Chat();
export default chatAPIs;
