export interface ILoginRequest {
  username: string;
  password: string;
}

export interface ILoginResponse {
  success: boolean;
  message: string;
  data: IUser;
}

export interface IGetUserByUsernameResponse {
  success: boolean;
  message: string;
  data: IUser;
}
export interface ILogoutResponse {
  success: boolean;
  message: string;
}

export interface IRegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface IRegisterResponse {
  success: boolean;
  message: string;
  data: IUser;
}

export interface IVerifyEmailRequest {
  username: string;
  email: string;
  verifyCode: string;
}

export interface IUser {
  _id: string;
  phone: string;
  username: string;
  fullname: string;
  email: string;
  avatar: string;
  isVerified: boolean;
  address: string;
  createdAt: string;
  updatedAt: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface IRequestGetUsersByIds {
  userIds: string[];
}

export interface IResponseGetUsersByIds {
  success: boolean;
  data: IUser[];
}
