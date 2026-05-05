import axiosInstance from '../axiosConfig';
import {IBodyCommentPost, IBodyCreatePost, IBodyLikePost, IGetPostResponse, IPostResponse} from './interface';

class Post {
  constructor() {}

  createPost(body: IBodyCreatePost): Promise<any> {
    return axiosInstance.post('/api/post/create-post', body);
  }

  likePost(body: IBodyLikePost): Promise<IPostResponse> {
    return axiosInstance.post('/api/post/like-post', body);
  }

  commentPost(body: IBodyCommentPost): Promise<IPostResponse> {
    return axiosInstance.post('/api/post/comment', body);
  }

  getPost(limit: number, cursor?: string): Promise<IGetPostResponse> {
    return axiosInstance.get(`/api/post/get-posts?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`);
  }

  getPostsByUserId(userId: string, limit: number, cursor?: string): Promise<IGetPostResponse> {
    return axiosInstance.get(
      `/api/post/get-posts-by-user/${userId}?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`,
    );
  }
}

export const postAPIs = new Post();
export default postAPIs;
