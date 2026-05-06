export interface IUploadAudioResponse {
  success: boolean;
  message: string;
  data: IDataUploadAudio;
}

export interface IDataUploadAudio {
  url: string;
  duration: number;
}

export interface IUploadImageResponse {
  success: boolean;
  message: string;
  data: IDataUploadImage;
}

export interface IDataUploadImage {
  urls: string[];
}
