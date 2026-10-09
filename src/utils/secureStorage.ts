import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const TOKEN_KEY = 'mostlyvers_jwt';
const REFRESH_TOKEN_KEY = 'mostlyvers_refresh_token';
const INSTALLATION_ID_KEY = 'mostlyvers_installation_id';
const CONTENT_KEY_PREFIX = 'mostlyvers_offline_key:';

export const setToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token', error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token', error);
    return null;
  }
};

export const clearToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing token', error);
  }
};

export const setRefreshToken = (token: string) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
export const clearRefreshToken = () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

export const persistSessionTokens = async (accessToken: string, refreshToken: string) => {
  await Promise.all([setToken(accessToken), setRefreshToken(refreshToken)]);
};

export const clearSessionTokens = async () => {
  await Promise.all([clearToken(), clearRefreshToken()]);
};

export const getOrCreateInstallationId = async (): Promise<string> => {
  const existing = await SecureStore.getItemAsync(INSTALLATION_ID_KEY);
  if (existing) return existing;
  const id = Crypto.randomUUID();
  await SecureStore.setItemAsync(INSTALLATION_ID_KEY, id);
  return id;
};

const contentKeyName = (readerId: string, bookId: string, version: string) =>
  `${CONTENT_KEY_PREFIX}${readerId}:${bookId}:${version}`;

export const setOfflineContentKey = (readerId: string, bookId: string, version: string, key: string) =>
  SecureStore.setItemAsync(contentKeyName(readerId, bookId, version), key);
export const getOfflineContentKey = (readerId: string, bookId: string, version: string) =>
  SecureStore.getItemAsync(contentKeyName(readerId, bookId, version));
export const deleteOfflineContentKey = (readerId: string, bookId: string, version: string) =>
  SecureStore.deleteItemAsync(contentKeyName(readerId, bookId, version));
