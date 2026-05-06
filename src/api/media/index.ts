import axiosInstance from '../axiosConfig';

class Media {
  constructor() {}

  uploadAudio(body: FormData): Promise<any> {
    return axiosInstance.post('/api/media/audio', body, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const mediaAPIs = new Media();
export default mediaAPIs;
