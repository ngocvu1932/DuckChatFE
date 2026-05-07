import {createSlice} from '@reduxjs/toolkit';

interface CallState {
  incomingCall: any | null;
  inCall: boolean;
  callWith: string | null;
}

const initialState: CallState = {
  incomingCall: null,
  inCall: false,
  callWith: null,
};

const callSlice = createSlice({
  name: 'callSlice',
  initialState,
  reducers: {
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
    },
    clearIncomingCall: (state) => {
      state.incomingCall = null;
    },
    setInCall: (state, action) => {
      state.inCall = action.payload;
    },
    setCallWith: (state, action) => {
      state.callWith = action.payload;
    },
  },
});

export const {setIncomingCall, clearIncomingCall, setInCall, setCallWith} = callSlice.actions;

export default callSlice;
