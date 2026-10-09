import api, { createIdempotencyKey } from './api';
import { BookSummary, CursorPage, ReadingLocator, ReadingProgress, ReadingSession } from '../types/api';
import { publicationDate } from './bookService';

export interface OwnedBook extends BookSummary { purchasedAt: string; progress?: ReadingProgress; bookmark?: ReadingLocator }

export const readingService = {
  getMyBooks: async () => {
    const data = (await api.get<CursorPage<OwnedBook>>('/me/books')).data;
    return data.items.map(book => ({
      _id: book.id, title: book.title, description: book.shortDescription, coverImage: book.coverUrl,
      publishedDate: publicationDate(book), price: (book.price?.amountMinor ?? 0) / 100, tags: [],
      purchasedAt: book.purchasedAt, bookmark: book.bookmark ? { page: book.bookmark.displayedPage || 1, locator: book.bookmark } : null,
      totalPages: book.progress?.locator.displayedPageCount,
      progressPercent: book.progress?.progressPercent || 0,
      lastReadAt: book.progress?.updatedAt,
    }));
  },
  createSession: async (bookId: string): Promise<ReadingSession> =>
    (await api.post<ReadingSession>(`/books/${bookId}/reading-sessions`, {}, { headers: { 'Idempotency-Key': createIdempotencyKey() } })).data,
  getResource: async (sessionId: string, resourceId: string): Promise<string> =>
    (await api.get<string>(`/reading-sessions/${sessionId}/resources/${resourceId}`, { responseType: 'text' })).data,
  getProgress: async (bookId: string): Promise<ReadingProgress | null> => (await api.get(`/me/books/${bookId}/progress`)).data,
  updateProgress: async (bookId: string, locator: ReadingLocator, version: number): Promise<ReadingProgress> =>
    (await api.put(`/me/books/${bookId}/progress`, {
      locator, progressPercent: Math.round(locator.progression * 10000) / 100, version,
    }, { headers: { 'Idempotency-Key': createIdempotencyKey() } })).data,
  setBookmark: async (bookId: string, locator: ReadingLocator) =>
    (await api.put(`/me/books/${bookId}/bookmark`, { locator }, { headers: { 'Idempotency-Key': createIdempotencyKey() } })).data,
  deleteBookmark: async (bookId: string) => { await api.delete(`/me/books/${bookId}/bookmark`); },
};
