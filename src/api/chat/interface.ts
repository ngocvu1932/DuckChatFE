export interface IChatResponse {
  statusCode: number;
  status: number;
  message: string;
  data: IChat[];
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

export interface IUserChat {
  _id: string;
  fullname: string;
  online: boolean;
  avatar: string;
}
