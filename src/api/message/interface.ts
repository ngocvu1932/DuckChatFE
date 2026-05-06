import {ETypeMessage} from '../../types/enum';

export interface IMessageResponse {
  success: boolean;
  message: string;
  data: IMessage[];
  nextCursor: string;
}

export interface IRequestCreateMessage {
  chatId: string;
  senderId: string;
  type: string;
  content: string;
  isSeen: string[];
  mediaUrl: string;
}

export interface IRequestReactMessage {
  chatId: string;
  messId: string;
  react: string;
  userId: string;
  receiverId?: string;
}

export interface IRequestRemoveReactMessage {
  chatId: string;
  messId: string;
  userId: string;
  receiverId?: string;
}

export interface IResponseReactMessage {
  chatId: string;
  messId: string;
  react: string;
  userId: string;
  receiverId?: string;
}

export type TMessageStatus = 'sending' | 'sent' | 'failed';

export interface IMessage {
  _id?: string;
  messageId: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  type: ETypeMessage;
  content: string;
  isSeen: string[];
  mediaUrl: string[];
  createdAt?: string;
  updatedAt?: string;
  status?: TMessageStatus; // chỉ dùng cho tin nhắn mới tạo (chưa có _id)
  react?: IReactMessage[];
}

export interface IReactMessage {
  react: string;
  count: number;
  user: string[];
}
