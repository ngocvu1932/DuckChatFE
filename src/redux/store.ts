import {configureStore} from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import chatSlice from './slices/chatSlice';
import messageSlice from './slices/messageSlice';
import usersSlice from './slices/usersSlice';
import callSlice from './slices/callSlice';

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    users: usersSlice.reducer,
    chat: chatSlice.reducer,
    message: messageSlice.reducer,
    call: callSlice.reducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
