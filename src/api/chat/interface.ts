export interface IChatResponse {
  success: boolean;
  message: string;
  data: IChat[];
}

export interface IMessageResponse {
  success: boolean;
  message: string;
  data: IMessage[];
}

export type TMessageStatus = 'sending' | 'sent' | 'failed';

export interface IMessage {
  _id?: string;
  messageId: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  type: string;
  content: string;
  isSeen: string[];
  mediaUrl: string;
  createdAt?: string;
  updatedAt?: string;
  status?: TMessageStatus; // chỉ dùng cho tin nhắn mới tạo (chưa có _id)
}

export interface IChat {
  _id: string;
  user: IUserChat[];
  isGroupChat: boolean;
  chatName: string;
  isSeen: [];
  groupImgUri: string;
  createdAt: string;
  updatedAt: string;
  isPin: boolean;
  isDelete: boolean;
  isHide: boolean;
  lastMessage: {
    messageId: string;
    sender: string;
    content: string;
    timestamp: string;
  };
}

export interface IRequestCreateMessgae {
  chatId: string;
  senderId: string;
  type: string;
  content: string;
  isSeen: string[];
  mediaUrl: string;
}

export interface IUserChat {
  _id: string;
  fullname: string;
  online: boolean;
  avatar: string;
}
