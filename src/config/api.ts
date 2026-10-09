const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const BASE_URL = configuredUrl || (__DEV__ ? 'http://10.0.2.2:5001/v1' : '');
export const API_TIMEOUT = 20_000;

if (!BASE_URL) throw new Error('EXPO_PUBLIC_API_URL must be configured for production builds.');
