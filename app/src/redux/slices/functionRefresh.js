// features/functionRefresh/functionRefreshSlice.js
import { createSlice } from '@reduxjs/toolkit';

const functionRefreshSlice = createSlice({
  name: 'functionRefresh',
  initialState: { refresh: false},
  reducers: {
    swapRefresh: (state) => {
      state.refresh = !state.refresh;
    },
  },
});

export const { swapRefresh } = functionRefreshSlice.actions;
export const functionRefreshReducer = functionRefreshSlice.reducer;

