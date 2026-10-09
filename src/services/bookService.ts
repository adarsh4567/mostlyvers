import api from './api';
import { BookSummary, CursorPage, formatMoney } from '../types/api';

export const publicationDate = (book: BookSummary) =>
  new Date(Date.UTC(book.publicationYear, Math.max(0, book.publicationMonth - 1), 1)).toISOString();

export const toViewBook = (book: BookSummary) => ({
  _id: book.id,
  title: book.title,
  description: book.shortDescription,
  publishedDate: publicationDate(book),
  price: (book.price?.amountMinor ?? 0) / 100,
  localizedPrice: book.price ? formatMoney(book.price) : undefined,
  coverImage: book.coverUrl,
  tags: [] as string[],
  ownership: book.ownership,
  status: book.status,
  discountPercent: book.prebook?.discountPercent,
  prebookPrice: book.prebook?.price ? book.prebook.price.amountMinor / 100 : undefined,
  prebookLocalizedPrice: book.prebook?.price ? formatMoney(book.prebook.price) : undefined,
  billing: book.billing,
  youtubeAvailability: book.youtubeAvailability,
});

export const bookService = {
  getLibrary: async (search?: string, cursor?: string) => {
    const { data } = await api.get<CursorPage<BookSummary>>('/books', { params: { query: search || undefined, cursor, limit: 30 } });
    return { books: data.items.map(toViewBook), total: data.items.length, nextCursor: data.nextCursor };
  },
  getBookDetails: async (bookId: string) => {
    const book = (await api.get<BookSummary>(`/books/${bookId}`)).data;
    return toViewBook(book);
  },
  getLatest: async () => (await api.get<CursorPage<BookSummary>>('/books/latest')).data.items.map(toViewBook),
  getUpcoming: async () => (await api.get<CursorPage<BookSummary>>('/books/upcoming')).data.items.map(toViewBook),
};
