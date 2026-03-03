import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// base configuration used by both clients
const baseConfig = {
  baseURL: '/api',
  withCredentials: true,
};

export const publicApi = axios.create(baseConfig);
export const privateApi = axios.create(baseConfig);

// refresh-on-401 logic
privateApi.interceptors.response.use(
  undefined,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/refresh')
    ) {
      original._retry = true;
      try {
        await publicApi.post('/auth/refresh');
        // Token is now in cookie, retry original request
        return privateApi(original);
      } catch (e) {
        // failed refresh; user will need to login again
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);
