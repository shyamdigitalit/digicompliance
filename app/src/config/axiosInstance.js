import axios from "axios";
import { getStore } from "../redux/storeAccessor";
import { logout, setToken } from "../redux/slices/auth";

const env = import.meta.env.VITE_ENV || 'dev';
const appenv = import.meta.env.VITE_APP_ENV || 'quality';

const baseUrl = {
    dev: {
        quality: import.meta.env.VITE_API_URL_DEVQ,
        production: import.meta.env.VITE_API_URL_DEVP,
    },
    live: {
        quality: import.meta.env.VITE_API_URL_QAS,
        production: import.meta.env.VITE_API_URL_PRD,
    }
};

// console.log(baseUrl[env][appenv]);

const axiosInstance = axios.create({
    baseURL: baseUrl[env][appenv],
    withCredentials: true, // ✅ crucial for cookies
});

/* ===============================
   REQUEST INTERCEPTOR
================================ */
axiosInstance.interceptors.request.use(
  (config) => {
    const store = getStore();
    const token = store?.getState()?.auth?.accessToken;

    if (token && config.method !== "options") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ===============================
   RESPONSE INTERCEPTOR
================================ */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const store = getStore();
    const originalRequest = error.config;

    const status = error?.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        
        const response = await axios.post(`${baseUrl[env][appenv]}/api/auth/refresh`, {}, { withCredentials: true });

        store.dispatch(setToken(response.data));

        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axiosInstance(originalRequest);

      } catch (err) {
        console.log(err)
        store.dispatch(logout());
        // window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
