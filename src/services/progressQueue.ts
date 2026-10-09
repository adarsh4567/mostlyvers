import { createMMKV } from 'react-native-mmkv';
import api, { createIdempotencyKey } from './api';
import { ReadingLocator, ReadingProgress } from '../types/api';

interface PendingProgress { bookId: string; locator: ReadingLocator; version: number; queuedAt: string }
const storage = createMMKV({ id: 'mostlyvers-progress-queue' });
const KEY = 'pending';
const read = (): PendingProgress[] => { try { return JSON.parse(storage.getString(KEY) || '[]'); } catch { return []; } };
const write = (items: PendingProgress[]) => storage.set(KEY, JSON.stringify(items));

export const queueProgress = (bookId: string, locator: ReadingLocator, version: number) => {
  const item = { bookId, locator, version, queuedAt: new Date().toISOString() };
  write([...read().filter(entry => entry.bookId !== bookId), item]);
};

export const flushProgressQueue = async (): Promise<void> => {
  for (const item of read().sort((a, b) => a.queuedAt.localeCompare(b.queuedAt))) {
    try {
      await api.put<ReadingProgress>(`/me/books/${item.bookId}/progress`, {
        locator: item.locator,
        progressPercent: Math.round(item.locator.progression * 10000) / 100,
        version: item.version,
      }, { headers: { 'Idempotency-Key': createIdempotencyKey() } });
      write(read().filter(entry => entry.bookId !== item.bookId));
    } catch (error: any) {
      if (error?.code === 'CONTENT_VERSION_CHANGED') write(read().filter(entry => entry.bookId !== item.bookId));
      else break;
    }
  }
};
