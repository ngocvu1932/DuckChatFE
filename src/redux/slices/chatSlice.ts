import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IChat, IMessage} from '../../api/chat/interface';

interface ChatState {
  chat: IChat[];
}

const initialState: ChatState = {
  chat: [],
};

const chatSlice = createSlice({
  name: 'chatSlice',
  initialState: initialState,
  reducers: {
    setChat: (state, action: PayloadAction<IChat[]>) => {
      state.chat = action.payload;
    },

    addChat: (state, action: PayloadAction<IChat>) => {
      state.chat.unshift(action.payload);
    },

    updateLastMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        message: IMessage; // nếu có IMessage thì dùng IMessage
      }>,
    ) => {
      const {chatId, message} = action.payload;

      const index = state.chat.findIndex((c) => c._id === chatId);
      if (index === -1) return;

      const chat = state.chat[index];

      const updatedChat = {
        ...chat,
        lastMessage: {
          messageId: crypto.randomUUID(), //generate id duy nhất nếu chưa có
          sender: message.senderId,
          content: message.content,
          timestamp: message.createdAt ?? new Date().toISOString(),
        },
      };

      // remove vị trí cũ
      state.chat.splice(index, 1);

      // đưa lên đầu
      state.chat.unshift(updatedChat);
    },
  },
});

export const {setChat, addChat, updateLastMessage} = chatSlice.actions;
export default chatSlice;
