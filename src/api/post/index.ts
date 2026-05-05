import axiosInstance from '../axiosConfig';
import {IBodyCreatePost, IGetPostResponse} from './interface';

class Post {
  constructor() {}

  createPost(body: IBodyCreatePost): Promise<any> {
    return axiosInstance.post('/api/post/create-post', body);
  }

  getPost(limit: number, cursor?: string): Promise<IGetPostResponse> {
    return axiosInstance.get(`/api/post/get-posts?page=1&limit=${limit}`);
  }
}

export const postAPIs = new Post();
export default postAPIs;
