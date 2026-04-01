import axios from 'axios';

const env = import.meta.env.VITE_ENV || 'dev';
const appenv = import.meta.env.VITE_APP_ENV || 'quality';

const baseUrl = {
    dev: {
        quality: import.meta.env.VITE_APIURL_DEVQ,
        production: import.meta.env.VITE_APIURL_DEVP,
    },
    live: {
        quality: import.meta.env.VITE_APIURL_QAS,
        production: import.meta.env.VITE_APIURL_PRD,
    }
};

const basicAuthHeader = 'Basic ' + btoa(`${import.meta.env.VITE_API_USR}:${import.meta.env.VITE_API_PSS}`);

const axiosInstance = axios.create({
    baseURL: baseUrl[env][appenv],
    withCredentials: true, // ✅ crucial for cookies
});

export const setupInterceptors = (store) => {
    // ✅ Request Interceptor
    axiosInstance.interceptors.request.use(
        (config) => {
            const isFormData = config.data instanceof FormData;

            if (!isFormData) {
                config.headers['Content-Type'] = 'application/json';
                config.headers['Accept'] = 'application/json';
            }
            config.headers['X-Requested-With'] = 'X';

            if (config.url?.startsWith('/api/auth')) {
                const { accessToken } = store.getState().auth; // 🔹 Get from Redux
                if (accessToken) {
                    config.headers['Authorization'] = `Bearer ${accessToken}`;
                }
            } else {
                config.headers['Authorization'] = basicAuthHeader;
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    // ✅ Response Interceptor (auto-refresh)
    axiosInstance.interceptors.response.use(
        res => res,
        async (error) => {
            const originalRequest = error.config;

            if (originalRequest.url?.includes('/api/auth/refresh')) {
                return Promise.reject(error);
            }

            const excludedEndpoints = ['/api/auth/login', '/api/auth/register'];
            const isExcluded = excludedEndpoints.some(path => originalRequest.url?.includes(path));

            if (
                error.response?.status === 401 &&
                !originalRequest._retry &&
                !isExcluded
            ) {
                originalRequest._retry = true;

                try {
                    const res = await axiosInstance.post('/api/auth/refresh');
                    const newToken = res.data.accessToken;

                    // 🔹 Update Redux store only
                    store.dispatch({ type: 'auth/setAccessToken', payload: newToken });

                    // Retry original request with new token
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                } catch (refreshErr) {
                    store.dispatch({ type: 'auth/logout' });
                    return Promise.reject(refreshErr);
                }
            }

            return Promise.reject(error);
        }
    );
};

export default axiosInstance;
