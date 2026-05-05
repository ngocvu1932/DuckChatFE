export interface IGetPostResponse {
  success: boolean;
  message?: string;
  data: IPost[];
  nextCursor?: string | null;
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
  images?: string[];
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

export interface IBodyLikePost {
  postId: string;
}

export interface IBodyCommentPost {
  postId: string;
  content: string;
  images?: string[];
}

export interface IPostResponse {
  success: boolean;
  message: string;
  data: IPost;
}
