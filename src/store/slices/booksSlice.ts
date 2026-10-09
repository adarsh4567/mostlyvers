import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Book {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  publishedDate: string;
  price: number;
  tags: string[];
  discountPercent?: number;
  prebookPrice?: number;
  youtubeUrl?: string;
  localizedPrice?: string;
  prebookLocalizedPrice?: string;
  ownership?: 'NONE' | 'PREBOOKED' | 'OWNED';
  status?: 'UPCOMING' | 'PUBLISHED' | 'ARCHIVED';
  billing?: { purchaseProductId?: string; prebookProductId?: string };
  youtubeAvailability?: boolean;
}

export interface PurchasedBook extends Book {
  purchasedAt: string;
  totalPages?: number;
  bookmark?: { page: number } | null;
  progressPercent?: number;
  lastReadAt?: string;
}

interface BooksState {
  library: Book[];
  latest: Book[];
  upcoming: Book[];
  myBooks: PurchasedBook[];
  currentBook: Book | null;
  libraryTotal: number;
}

const initialState: BooksState = {
  library: [],
  latest: [],
  upcoming: [],
  myBooks: [],
  currentBook: null,
  libraryTotal: 0,
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setLibrary: (state, action: PayloadAction<{ books: Book[]; total: number }>) => {
      state.library = action.payload.books;
      state.libraryTotal = action.payload.total;
    },
    setLatest: (state, action: PayloadAction<Book[]>) => {
      state.latest = action.payload;
    },
    setUpcoming: (state, action: PayloadAction<Book[]>) => {
      state.upcoming = action.payload;
    },
    setMyBooks: (state, action: PayloadAction<PurchasedBook[]>) => {
      state.myBooks = action.payload;
    },
    setCurrentBook: (state, action: PayloadAction<Book | null>) => {
      state.currentBook = action.payload;
    },
  },
});

export const { setLibrary, setLatest, setUpcoming, setMyBooks, setCurrentBook } = booksSlice.actions;
export default booksSlice.reducer;
