import {configureStore} from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import chatSlice from './slices/chatSlice';
import messageSlice from './slices/messageSlice';

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    chat: chatSlice.reducer,
    message: messageSlice.reducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
