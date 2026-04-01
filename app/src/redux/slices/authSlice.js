import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance.js';

const initvl = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
    try {
        const data = await axiosInstance.post('/api/auth/login', credentials).then(res => res.data);
        return data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || 'Login failed');
    }
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, thunkAPI) => {
    try {
        const data = await axiosInstance.get('/api/auth/session').then(res => res.data);
        return data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || 'Not authenticated');
    }
});

export const logout = createAsyncThunk('auth/logout', async () => {
    const data = await axiosInstance.post('/api/auth/logout').then(res => res.data);
    return data;
});


const authSlice = createSlice({
    name: 'auth',
    initialState: initvl,
    reducers: {
        setAccessToken: (state, action) => {
            state.user = { ...state.user, token: action.payload };
            state.isAuthenticated = true;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.data
            // state.accessToken = action.payload.accessToken;

        })
        .addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(checkAuth.pending, (state) => {
            state.loading = true;
            // console.log(state);
        })
        .addCase(checkAuth.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.data;
            // console.log(state);
        })
        .addCase(checkAuth.rejected, (state) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            // console.log(state);
        })
        .addCase(logout.fulfilled, (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.loading = false;
            state.error = null;
            // state.accessToken = null
        });
    },
});

// export const { setAccessToken } = authSlice.actions;
export default authSlice.reducer;