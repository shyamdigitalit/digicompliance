import { combineReducers, configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { snackbarReducer } from './slices/snackbar';
import { functionRefreshReducer } from './slices/functionRefresh';
import authReducer from './slices/authSlice';
import masterReducer from './slices/masterSlice';


const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'], // Only persist the specified slices
}

// const rootReducer = combineReducers({
//     auth: authReducer,
//     master: masterReducer,
//     snackbar: snackbarReducer,
//     functionRefresh: functionRefreshReducer,
// });
const appReducer = combineReducers({
    auth: authReducer,
    master: masterReducer,
    snackbar: snackbarReducer,
    functionRefresh: functionRefreshReducer,
});

const rootReducer = (state, action) => {
    if (action.type === 'auth/logout/fulfilled') {
        state = undefined; // 🔥 FULL RESET
    }
    return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
    }),
    // devTools: import.meta.env.MODE === 'dev',
});

export const persistor = persistStore(store);
export default store;