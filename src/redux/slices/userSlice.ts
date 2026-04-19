import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IUser} from '../../api/auth/interface';

interface UserState {
  user?: IUser;
}

const initialState: UserState = {
  user: undefined,
};

const userSlice = createSlice({
  name: 'userSlice',
  initialState: initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = undefined;
    },
  },
});

export const {setUser, clearUser} = userSlice.actions;
export default userSlice;
