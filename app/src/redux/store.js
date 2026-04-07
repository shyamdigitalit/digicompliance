import { combineReducers, configureStore } from '@reduxjs/toolkit';
import storage from 'redux-persist/es/storage';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import authReducer from './slices/auth';
import { snackbarReducer } from './slices/snackbar';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'], // Only persist the specified slices
}

const rootReducer = combineReducers({
    auth: authReducer,
    snackbar: snackbarReducer,
});

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