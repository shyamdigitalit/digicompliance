import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  loading: false,
};

const auth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /* =====================
       LOGIN / REFRESH
    ====================== */
    setToken: (state, action) => {
      const { accessToken } = action.payload;

      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.loading = false;
    },

    setCredentials: (state, action) => {
      const { accessToken, data } = action.payload;

      state.accessToken = accessToken;
      state.user = data || null;
      state.isAuthenticated = true;
      state.loading = false;
    },

    /* =====================
       PROFILE UPDATE
    ====================== */
    updateProfile: (state, action) => {
      const { data } = action.payload;
      state.user = { ...state.user, ...data };
    },    

    /* =====================
       LOGOUT
    ====================== */
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },

    /* =====================
       OPTIONAL UI HELPERS
    ====================== */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setToken,
  setCredentials,
  updateProfile,
  logout,
  setLoading,
} = auth.actions;

export default auth.reducer;
