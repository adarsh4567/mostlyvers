import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthorContent {
  name: string;
  bioSnippet: string;
  fullBio: string;
  photoUrl: string;
}

export interface ContactContent {
  instagramUrl: string;
  instagramName: string;
  youtubeUrl: string;
  youtubeName: string;
  email: string;
  supportEmail?: string;
}

export interface AboutAppContent {
  content: string; // Could be HTML or markdown or simple string sections
}

interface ContentState {
  author: AuthorContent | null;
  contact: ContactContent | null;
  aboutApp: AboutAppContent | null;
  deviceFee: number | null;
}

const initialState: ContentState = {
  author: null,
  contact: null,
  aboutApp: null,
  deviceFee: null,
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setAuthor: (state, action: PayloadAction<AuthorContent>) => {
      state.author = action.payload;
    },
    setContact: (state, action: PayloadAction<ContactContent>) => {
      state.contact = action.payload;
    },
    setAboutApp: (state, action: PayloadAction<AboutAppContent>) => {
      state.aboutApp = action.payload;
    },
    setDeviceFee: (state, action: PayloadAction<number>) => {
      state.deviceFee = action.payload;
    },
  },
});

export const { setAuthor, setContact, setAboutApp, setDeviceFee } = contentSlice.actions;
export default contentSlice.reducer;
