import axiosInstance from '../axiosConfig';
import {IMessageResponse, IRequestCreateMessage, IRequestReactMessage} from './interface';

class Message {
  constructor() {}

  createMessage(body: IRequestCreateMessage): Promise<any> {
    return axiosInstance.post('/api/message/create-message', body);
  }

  reactMessage(body: IRequestReactMessage): Promise<any> {
    return axiosInstance.post('/api/message/react-message', body);
  }

  getMessages(chatId: string, limit: number, cursor?: string): Promise<IMessageResponse> {
    return axiosInstance.get(
      `/api/message/get-messages?chatId=${chatId}&limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`,
    );
  }
}

export const messageAPIs = new Message();
export default messageAPIs;
