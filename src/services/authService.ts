import api, { setApiToken } from './api';
import { Reader, Session } from '../types/api';
import { getDeviceContext } from '../utils/deviceInfo';
import { getRefreshToken, persistSessionTokens } from '../utils/secureStorage';
import { AUTH_API_TIMEOUT } from '../config/api';
import { runWithTransientRetry } from './transientRetry';

const acceptSession = async (session: Session): Promise<Session> => {
  await persistSessionTokens(session.accessToken, session.refreshToken);
  setApiToken(session.accessToken);
  return session;
};

export const authService = {
	requestSignupOTP: async (email: string): Promise<{ challengeId: string; expiresAt: string; developmentCode?: string }> =>
		(await api.post('/auth/email-otp/request', { email: email.trim().toLowerCase() }, { timeout: AUTH_API_TIMEOUT })).data,
  login: async (email: string, password: string): Promise<Session> => {
    const device = await getDeviceContext('LOGIN');
    const { data } = await runWithTransientRetry(() => api.post<Session>('/auth/login', {
      email: email.trim().toLowerCase(), password, device,
    }, { timeout: AUTH_API_TIMEOUT }));
    return acceptSession(data);
  },
  signup: async (formData: FormData): Promise<Session> => {
    formData.append('device', JSON.stringify(await getDeviceContext('SIGNUP')));
    const { data } = await api.post<Session>('/auth/signup', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: AUTH_API_TIMEOUT,
    });
    return acceptSession(data);
  },
  restoreSession: async (): Promise<Session | null> => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;
    const { data } = await api.post<Session>('/auth/refresh', { refreshToken }, { timeout: AUTH_API_TIMEOUT });
    return acceptSession(data);
  },
  logout: async (): Promise<void> => { await api.post('/auth/logout'); },
  requestPasswordReset: async (email: string): Promise<void> => {
    await api.post('/auth/password-reset/request', { email: email.trim().toLowerCase() }, { timeout: AUTH_API_TIMEOUT });
  },
  confirmPasswordReset: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/password-reset/confirm', { token, password }, { timeout: AUTH_API_TIMEOUT });
  },
  getProfile: async (): Promise<Reader> => (await api.get<Reader>('/me')).data,
  updateProfile: async (payload: Partial<Pick<Reader, 'name' | 'age' | 'gender' | 'phone'>>): Promise<Reader> =>
    (await api.patch<Reader>('/me', payload)).data,
  updateProfilePicture: async (formData: FormData): Promise<Reader> =>
    (await api.post<Reader>('/me/profile-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data,
  requestAccountDeletion: async (): Promise<void> => { await api.post('/me/account-deletion/request'); },
};
