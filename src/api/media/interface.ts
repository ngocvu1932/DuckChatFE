export interface IUploadAudioResponse {
  success: boolean;
  message: string;
  data: IDataUploadAudio;
}

export interface IDataUploadAudio {
  url: string;
  duration: number;
}
