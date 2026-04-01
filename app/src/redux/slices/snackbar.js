// features/snackbar/snackbarSlice.js
import { createSlice } from '@reduxjs/toolkit';

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState: {
    open: false,
    message: '',
    severity: 'info', // can be 'success', 'error', 'warning', 'info'
    duration: 5000,
  },
  reducers: {
    showSnackbar: (state, action) => {
      const { message, severity = 'info', duration = 5000 } = action.payload;
      state.open = true;
      state.message = message;
      state.severity = severity;
      state.duration = duration;
    },
    closeSnackbar: (state) => {
      state.open = false;
    },
  },
});

export const { showSnackbar, closeSnackbar } = snackbarSlice.actions;
export const snackbarReducer = snackbarSlice.reducer;

