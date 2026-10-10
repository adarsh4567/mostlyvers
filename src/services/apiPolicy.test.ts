import { shouldAttemptAuthRefresh } from './api';

describe('authentication refresh policy', () => {
  it.each([
    '/auth/login',
    '/auth/signup',
    '/auth/refresh',
    '/auth/email-otp/request',
    '/auth/password-reset/request',
  ])('does not turn a 401 from %s into a refresh attempt', (url) => {
    expect(shouldAttemptAuthRefresh(url, 401, false)).toBe(false);
  });

  it('refreshes once for an expired protected request', () => {
    expect(shouldAttemptAuthRefresh('/me', 401, false)).toBe(true);
    expect(shouldAttemptAuthRefresh('/me', 401, true)).toBe(false);
  });
});
