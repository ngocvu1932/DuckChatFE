import axiosInstance from '../axiosConfig';
import {IChatResponse, IMessageResponse, IRequestCreateMessgae} from './interface';

class Chat {
  constructor() {}

  getChats(): Promise<IChatResponse> {
    return axiosInstance.get('/api/chat/get-chats');
  }

  createMessage(body: IRequestCreateMessgae): Promise<IChatResponse> {
    return axiosInstance.post('/api/chat/create-message', body);
  }

  getMessages(chatId: string, limit: number, cursor?: string): Promise<IMessageResponse> {
    return axiosInstance.get(
      `/api/chat/get-messages?chatId=${chatId}&limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`,
    );
  }
}

export const chatAPIs = new Chat();
export default chatAPIs;
