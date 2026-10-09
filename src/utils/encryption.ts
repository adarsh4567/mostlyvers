import { Buffer } from '@craftzdog/react-native-buffer';
import { createDecipheriv, createHash } from 'react-native-quick-crypto';

/**
 * Offline packages use AES-256-GCM. The server appends the 16-byte auth tag to
 * the ciphertext and returns the 12-byte nonce separately in the license.
 */
export const decryptAesGcm = (encrypted: Uint8Array, keyBase64: string, nonceBase64: string): Uint8Array => {
  if (encrypted.byteLength <= 16) throw new Error('Encrypted package is invalid.');
  const bytes = Buffer.from(encrypted);
  const ciphertext = bytes.subarray(0, bytes.length - 16);
  const authTag = bytes.subarray(bytes.length - 16);
  const key = Buffer.from(keyBase64, 'base64');
  const nonce = Buffer.from(nonceBase64, 'base64');
  if (key.length !== 32 || nonce.length !== 12) throw new Error('Offline license contains invalid encryption material.');
  const decipher = createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(authTag);
  return new Uint8Array(Buffer.concat([decipher.update(ciphertext), decipher.final()]));
};

export const sha256Hex = (bytes: Uint8Array): string =>
  createHash('sha256').update(Buffer.from(bytes)).digest('hex');

export const constantTimeHexEqual = (left: string, right: string): boolean => {
  const a = left.trim().toLowerCase();
  const b = right.trim().toLowerCase();
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
};
