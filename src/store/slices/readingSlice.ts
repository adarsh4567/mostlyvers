import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReadingState {
  bookmarks: Record<string, number>; // { bookId: pageNumber }
  progress: Record<string, number>;  // { bookId: pageNumber }
  lastRead: Record<string, string>;  // { bookId: ISO timestamp }
  downloads: string[];               // bookIds with local encrypted files
  pendingBookmarkSync: Record<string, number>; // offline queue
}

const initialState: ReadingState = {
  bookmarks: {},
  progress: {},
  lastRead: {},
  downloads: [],
  pendingBookmarkSync: {},
};

const readingSlice = createSlice({
  name: 'reading',
  initialState,
  reducers: {
    setBookmark: (state, action: PayloadAction<{ bookId: string; page: number }>) => {
      state.bookmarks[action.payload.bookId] = action.payload.page;
      state.lastRead[action.payload.bookId] = new Date().toISOString();
    },
    setProgress: (state, action: PayloadAction<{ bookId: string; page: number }>) => {
      state.progress[action.payload.bookId] = action.payload.page;
    },
    addDownload: (state, action: PayloadAction<string>) => {
      if (!state.downloads.includes(action.payload)) {
        state.downloads.push(action.payload);
      }
    },
    removeDownload: (state, action: PayloadAction<string>) => {
      state.downloads = state.downloads.filter((id) => id !== action.payload);
    },
    setDownloads: (state, action: PayloadAction<string[]>) => {
      state.downloads = action.payload;
    },
    queueBookmarkSync: (state, action: PayloadAction<{ bookId: string; page: number }>) => {
      state.pendingBookmarkSync[action.payload.bookId] = action.payload.page;
      // also update local optimistic state
      state.bookmarks[action.payload.bookId] = action.payload.page;
      state.lastRead[action.payload.bookId] = new Date().toISOString();
    },
    clearBookmarkSync: (state, action: PayloadAction<string>) => {
      delete state.pendingBookmarkSync[action.payload];
    },
  },
});

export const {
  setBookmark,
  setProgress,
  addDownload,
  removeDownload,
  setDownloads,
  queueBookmarkSync,
  clearBookmarkSync,
} = readingSlice.actions;

export default readingSlice.reducer;
