import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IMessage} from '../../api/message/interface';

type ChatState = {
  messagesByChatId: {
    [chatId: string]: IMessage[];
  };
};

const initialState: ChatState = {
  messagesByChatId: {},
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    //set full messages (API load)
    setMessages: (state, action: PayloadAction<{chatId: string; messages: IMessage[]}>) => {
      const {chatId, messages} = action.payload;
      state.messagesByChatId[chatId] = messages;
    },

    // add message (socket / gửi tin)
    addMessage: (state, action: PayloadAction<IMessage>) => {
      const msg = action.payload;

      if (!state.messagesByChatId[msg.chatId]) {
        state.messagesByChatId[msg.chatId] = [];
      }

      state.messagesByChatId[msg.chatId].unshift(msg);
    },

    addMessages: (state, action: PayloadAction<{chatId: string; messages: IMessage[]}>) => {
      const {chatId, messages} = action.payload;

      if (!state.messagesByChatId[chatId]) {
        state.messagesByChatId[chatId] = [];
      }

      const existing = state.messagesByChatId[chatId];

      // 🔥 merge + tránh duplicate
      const merged = [...existing, ...messages].filter(
        (msg, index, self) => index === self.findIndex((m) => m._id === msg._id),
      );

      state.messagesByChatId[chatId] = merged;
    },

    updateMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        newMessage: IMessage;
      }>,
    ) => {
      const {chatId, messageId, newMessage} = action.payload;

      const messages = state.messagesByChatId[chatId];
      if (!messages) return;

      const index = messages.findIndex((m) => m.messageId === messageId);

      if (index !== -1) {
        messages[index] = {
          ...messages[index],
          ...newMessage,
          status: 'sent',
        };
      }
    },

    updateReactMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        react: string;
        userId: string;
      }>,
    ) => {
      const {chatId, messageId, react, userId} = action.payload;

      const messages = state.messagesByChatId[chatId];
      if (!messages) return console.log('không có chat');
      const message = messages.find((m) => m._id === messageId);
      if (!message) return console.log('không có mess');
      if (!message.react) {
        message.react = [];
      }

      // tìm đúng record (react + user)
      const reactItem = message.react.find((r) => r.react === react && r.user.includes(userId));

      if (reactItem) {
        // đã tồn tại → tăng count
        reactItem.count += 1;
      } else {
        // 🔥 chưa có → tạo mới
        message.react.push({
          react,
          user: [userId], // hoặc user: userId nếu bạn đổi schema
          count: 1,
        });
      }
    },

    updateRemoveReactMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        messageId: string;
        userId: string;
      }>,
    ) => {
      const {chatId, messageId, userId} = action.payload;

      const messages = state.messagesByChatId[chatId];
      if (!messages) return console.log('không có chat');

      const message = messages.find((m) => m._id === messageId);
      if (!message) return console.log('không có mess');
      if (!message.react) return;

      message.react = message.react.filter((r) => !r.user.includes(userId));
    },

    markFailed: (state, action: PayloadAction<{chatId: string; messageId: string}>) => {
      const {chatId, messageId} = action.payload;

      const messages = state.messagesByChatId[chatId];
      if (!messages) return;

      const msg = messages.find((m) => m.messageId === messageId);
      if (msg) {
        msg.status = 'failed';
      }
    },

    clearMessages: (state, action: PayloadAction<{chatId: string}>) => {
      delete state.messagesByChatId[action.payload.chatId];
    },
  },
});

export const {
  setMessages,
  addMessage,
  updateReactMessage,
  updateRemoveReactMessage,
  addMessages,
  updateMessage,
  clearMessages,
} = messageSlice.actions;

export default messageSlice;
