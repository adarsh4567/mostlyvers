const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const BASE_URL = configuredUrl || (__DEV__ ? 'http://10.0.2.2:5001/v1' : '');
// Render's free service can take tens of seconds to wake. Keep ordinary app
// requests alive through that window instead of reporting a false offline error.
export const API_TIMEOUT = 60_000;
export const AUTH_API_TIMEOUT = 60_000;

if (!BASE_URL) throw new Error('EXPO_PUBLIC_API_URL must be configured for production builds.');
