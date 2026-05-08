import axios from 'axios';

const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || '';
};

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Allow browser/axios to set correct Content-Type for FormData uploads
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }

    // Handle Client Side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth:token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Handle Server Side
    else {
      try {
        // Dynamic import to avoid client-side bundling issues
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const token = cookieStore.get('auth:token')?.value;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // Fallback or ignore if cookies() is called outside of request context
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth:token');
        localStorage.removeItem('currentUser');
        // window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
