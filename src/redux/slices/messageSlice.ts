import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {IMessage} from '../../api/chat/interface';

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

      state.messagesByChatId[msg.chatId].push(msg);
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

export const {setMessages, addMessage, updateMessage, clearMessages} = messageSlice.actions;

export default messageSlice;
