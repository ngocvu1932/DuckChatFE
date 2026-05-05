export interface IGetPostResponse {
  success: boolean;
  message: string;
  data: IPost[];
  nextCursor: string;
}

export interface IPostAuthor {
  _id: string;
  fullname: string;
  username: string;
  avatar: string;
}

export interface IComment {
  _id: string;
  user: IPostAuthor;
  content: string;
  createdAt: string;
}

export interface IPost {
  _id: string;
  user: IPostAuthor;
  content: string;
  images: string[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
  comments: IComment[];
}

export interface IBodyCreatePost {
  content: string;
  images: string[];
  visibility: string;
}
