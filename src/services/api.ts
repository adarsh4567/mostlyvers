import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as Crypto from 'expo-crypto';
import { createNavigationContainerRef } from '@react-navigation/native';
import { BASE_URL, API_TIMEOUT } from '../config/api';
import { clearSessionTokens, getRefreshToken, getToken, persistSessionTokens } from '../utils/secureStorage';
import { ApiProblem, Session } from '../types/api';

export const navigationRef = createNavigationContainerRef<any>();
export let currentToken: string | null = null;
let refreshRequest: Promise<string> | null = null;
let authHandlers: {
  onSession: (session: Session) => void;
  onToken: (token: string) => void;
  onLogout: () => void;
} | null = null;

export const configureApiAuthHandlers = (handlers: NonNullable<typeof authHandlers>) => {
  authHandlers = handlers;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code = 'NETWORK_ERROR',
    public readonly requestId?: string,
    public readonly status?: number,
    public readonly details?: Record<string, unknown>,
  ) { super(message); this.name = 'ApiError'; }
}

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError<ApiProblem>(error)) {
    const problem = error.response?.data?.error;
    return new ApiError(
      problem?.message || (error.request ? 'Unable to reach MOSTLYVERS. Check your connection.' : error.message),
      problem?.code || 'NETWORK_ERROR', problem?.requestId, error.response?.status, problem?.details,
    );
  }
  return new ApiError(error instanceof Error ? error.message : 'Unexpected error');
};

export const initializeToken = async () => { currentToken = await getToken(); };
export const setApiToken = (token: string | null) => { currentToken = token; };
export const createIdempotencyKey = () => Crypto.randomUUID();

const api = axios.create({ baseURL: BASE_URL, timeout: API_TIMEOUT });
const refreshClient = axios.create({ baseURL: BASE_URL, timeout: API_TIMEOUT });

const resetToAuth = async () => {
  currentToken = null;
  await clearSessionTokens();
  authHandlers?.onLogout();
  if (navigationRef.isReady()) navigationRef.reset({ index: 0, routes: [{ name: 'Auth' }] });
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new ApiError('Your session has expired.', 'AUTH_EXPIRED', undefined, 401);
  const { data } = await refreshClient.post<Session>('/auth/refresh', { refreshToken });
  await persistSessionTokens(data.accessToken, data.refreshToken);
  currentToken = data.accessToken;
  authHandlers?.onSession(data);
  return data.accessToken;
};

api.interceptors.request.use(config => {
  if (currentToken) config.headers.Authorization = `Bearer ${currentToken}`;
  config.headers.Accept = 'application/json';
  return config;
});

api.interceptors.response.use(response => response, async (error: AxiosError<ApiProblem>) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
  const isRefresh = original?.url?.includes('/auth/refresh');
  if (error.response?.status !== 401 || !original || original._retried || isRefresh) {
    return Promise.reject(toApiError(error));
  }
  original._retried = true;
  try {
    refreshRequest ??= refreshAccessToken().finally(() => { refreshRequest = null; });
    const token = await refreshRequest;
    original.headers.Authorization = `Bearer ${token}`;
    authHandlers?.onToken(token);
    return api(original);
  } catch {
    await resetToAuth();
    return Promise.reject(new ApiError('Your session has expired.', 'AUTH_EXPIRED', undefined, 401));
  }
});

export default api;
