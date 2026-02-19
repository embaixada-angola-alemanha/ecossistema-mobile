import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@config/env';
import { useAuthStore } from '@store/auth-store';
import { ApiResponse, PagedData } from '@types/api';

const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });

  // Auth interceptor
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await useAuthStore.getState().getValidToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response unwrap interceptor
  client.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }
  );

  return client;
};

/** SGC API client (consular system — authenticated) */
export const sgcApi = createApiClient(ENV.SGC_API_URL);

/** WN API client (news — public) */
export const wnApi = createApiClient(ENV.WN_API_URL);

/** Extract data from ApiResponse wrapper */
export function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

/** Helper for paginated requests */
export async function fetchPaged<T>(
  client: AxiosInstance,
  path: string,
  page = 0,
  size = 20,
  params?: Record<string, string | number | boolean>
): Promise<PagedData<T>> {
  const response = await client.get<ApiResponse<PagedData<T>>>(path, {
    params: { page, size, ...params },
  });
  return response.data.data;
}
