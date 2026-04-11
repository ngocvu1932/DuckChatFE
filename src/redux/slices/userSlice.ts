import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  user: null,
  //   user: {
  //     name: 'John Doe',
  //     email: '',
  //   },
};

const userSlice = createSlice({
  name: 'userSlice',
  initialState: initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const {setUser} = userSlice.actions;
export default userSlice;
