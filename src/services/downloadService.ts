import { createMMKV } from 'react-native-mmkv';
import { Directory, File, Paths } from 'expo-file-system';
import api, { createIdempotencyKey, currentToken } from './api';
import { BASE_URL } from '../config/api';
import { CursorPage, DownloadRecord, OfflineLicense } from '../types/api';
import { constantTimeHexEqual, decryptAesGcm, sha256Hex } from '../utils/encryption';
import { parseEpub, ParsedEpub } from '../utils/epub';
import { deleteOfflineContentKey, getOfflineContentKey, setOfflineContentKey } from '../utils/secureStorage';

interface LocalDownload { bookId: string; readerId: string; title?: string; coverUrl?: string; packageVersion: string; leaseExpiresAt: string; fileName: string; checksumSha256: string; nonce: string; downloadedAt: string; contentLength: number }
const storage = createMMKV({ id: 'mostlyvers-downloads' });
const INDEX_KEY = 'download-index';
const readIndex = (): LocalDownload[] => { try { return JSON.parse(storage.getString(INDEX_KEY) || '[]'); } catch { return []; } };
const writeIndex = (items: LocalDownload[]) => storage.set(INDEX_KEY, JSON.stringify(items));
const booksDirectory = new Directory(Paths.document, 'books');
const ensureDirectory = () => { if (!booksDirectory.exists) booksDirectory.create({ idempotent: true, intermediates: true }); };

export const downloadService = {
  getServerDownloads: async (): Promise<DownloadRecord[]> => (await api.get<CursorPage<DownloadRecord>>('/me/downloads')).data.items,
  getMyDownloads: async (): Promise<string[]> => readIndex().map(item => item.bookId),
  getLocalDownloads: (): LocalDownload[] => readIndex(),
  lockReaderDownloads: async (readerId: string): Promise<void> => {
    for (const item of readIndex().filter(entry => entry.readerId === readerId)) {
      await deleteOfflineContentKey(item.readerId, item.bookId, item.packageVersion);
    }
  },
  restoreReaderDownloads: async (readerId: string): Promise<void> => {
    for (const item of readIndex().filter(entry => entry.readerId === readerId)) {
      const key = await getOfflineContentKey(item.readerId, item.bookId, item.packageVersion);
      const expiresSoon = Date.parse(item.leaseExpiresAt) - Date.now() < 24 * 60 * 60 * 1000;
      if (!key || expiresSoon) {
        try { await downloadService.renewLicense(item.bookId, readerId); } catch { /* The UI reports expired/revoked licenses when opened. */ }
      }
    }
  },
  downloadBook: async (
    bookId: string,
    readerId: string,
    metadata?: { title: string; coverUrl: string },
    onProgress?: (received: number, total: number) => void,
  ): Promise<LocalDownload> => {
    const license = (await api.post<OfflineLicense>(`/me/books/${bookId}/offline-license`, {}, {
      headers: { 'Idempotency-Key': createIdempotencyKey() },
    })).data;
    if (!currentToken) throw new Error('Authentication is required.');
    ensureDirectory();
    const fileName = `${readerId}-${bookId}-${license.packageVersion}.epub.enc`;
    const destination = new File(booksDirectory, fileName);
    const file = await File.downloadFileAsync(`${BASE_URL}${license.packagePath}`, destination, {
      idempotent: true,
      headers: { Authorization: `Bearer ${currentToken}` },
      onProgress: progress => onProgress?.(progress.bytesWritten, progress.totalBytes),
    });
    const bytes = await file.bytes();
    if (license.contentLength > 0 && bytes.byteLength !== license.contentLength) { file.delete(); throw new Error('Downloaded package size does not match the license.'); }
    if (!constantTimeHexEqual(sha256Hex(bytes), license.checksumSha256)) { file.delete(); throw new Error('Downloaded package failed integrity verification.'); }
    await setOfflineContentKey(readerId, bookId, license.packageVersion, license.contentKey);
    const record: LocalDownload = {
      bookId, readerId, title: metadata?.title, coverUrl: metadata?.coverUrl,
      packageVersion: license.packageVersion, leaseExpiresAt: license.leaseExpiresAt,
      fileName, checksumSha256: license.checksumSha256, nonce: license.nonce,
      downloadedAt: new Date().toISOString(), contentLength: bytes.byteLength,
    };
    writeIndex([...readIndex().filter(item => !(item.bookId === bookId && item.readerId === readerId)), record]);
    return record;
  },
  openOffline: async (bookId: string, readerId: string): Promise<ParsedEpub> => {
    const record = readIndex().find(item => item.bookId === bookId && item.readerId === readerId);
    if (!record) throw new Error('This book is not downloaded on this device.');
    if (Date.parse(record.leaseExpiresAt) <= Date.now()) throw new Error('OFFLINE_LICENSE_EXPIRED');
    const file = new File(booksDirectory, record.fileName);
    if (!file.exists) throw new Error('The downloaded book file is missing.');
    const encrypted = await file.bytes();
    if (!constantTimeHexEqual(sha256Hex(encrypted), record.checksumSha256)) throw new Error('The downloaded book is damaged.');
    const key = await getOfflineContentKey(readerId, bookId, record.packageVersion);
    if (!key) throw new Error('The offline license key is unavailable. Sign in online to renew it.');
    return parseEpub(decryptAesGcm(encrypted, key, record.nonce));
  },
  renewLicense: async (bookId: string, readerId: string): Promise<void> => {
    const current = readIndex().find(item => item.bookId === bookId && item.readerId === readerId);
    if (!current) throw new Error('Download not found.');
    const license = (await api.post<OfflineLicense>(`/me/books/${bookId}/offline-license/renew`, {}, {
      headers: { 'Idempotency-Key': createIdempotencyKey() },
    })).data;
    if (license.packageVersion !== current.packageVersion) throw new Error('CONTENT_VERSION_CHANGED');
    await setOfflineContentKey(readerId, bookId, license.packageVersion, license.contentKey);
    writeIndex(readIndex().map(item => item === current ? { ...item, leaseExpiresAt: license.leaseExpiresAt, nonce: license.nonce } : item));
  },
  deleteDownload: async (bookId: string, readerId?: string): Promise<void> => {
    const matches = readIndex().filter(item => item.bookId === bookId && (!readerId || item.readerId === readerId));
    for (const item of matches) {
      const file = new File(booksDirectory, item.fileName);
      if (file.exists) file.delete();
      await deleteOfflineContentKey(item.readerId, item.bookId, item.packageVersion);
    }
    writeIndex(readIndex().filter(item => !matches.includes(item)));
    await api.delete(`/me/downloads/${bookId}`);
  },
};
