import axiosInstance from '../axiosConfig';
import {IUploadAudioResponse, IUploadImageResponse} from './interface';

class Media {
  constructor() {}

  uploadAudio(body: FormData): Promise<IUploadAudioResponse> {
    return axiosInstance.post('/api/media/audio', body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  uploadImages(body: FormData): Promise<IUploadImageResponse> {
    return axiosInstance.post('/api/media/images', body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const mediaAPIs = new Media();
export default mediaAPIs;
