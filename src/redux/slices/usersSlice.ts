import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IUser} from '../../api/auth/interface';

interface UsersState {
  byId: Record<string, IUser>;
}

const initialState: UsersState = {
  byId: {},
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // 👉 add nhiều user (dùng khi load message list)
    addUsers: (state, action: PayloadAction<IUser[]>) => {
      action.payload.forEach((user) => {
        state.byId[user._id] = user;
      });
    },

    // 👉 add 1 user (khi cần fetch riêng)
    addUser: (state, action: PayloadAction<IUser>) => {
      const user = action.payload;
      state.byId[user._id] = user;
    },

    // 👉 update user (ví dụ đổi avatar)
    updateUser: (state, action: PayloadAction<IUser>) => {
      const user = action.payload;
      if (state.byId[user._id]) {
        state.byId[user._id] = {
          ...state.byId[user._id],
          ...user,
        };
      }
    },

    // 👉 clear (logout)
    clearUsers: (state) => {
      state.byId = {};
    },
  },
});

export const {addUsers, addUser, updateUser, clearUsers} = usersSlice.actions;

export default usersSlice;

export const selectUserById = (state: any, userId: string) => state.users.byId[userId];
// const user = useSelector((state) =>
//   selectUserById(state, message.senderId)
// );
