import api from './api';
import { BookSummary, CursorPage, ReadingProgress, YoutubeAsset } from '../types/api';

export interface AuthorContent { name: string; bioSnippet: string; fullBio: string; photoUrl: string; socialLinks?: Array<{ label: string; url: string }> }
export interface ContactContent { instagramUrl: string; instagramName: string; youtubeUrl: string; youtubeName: string; email: string; supportEmail?: string }
export interface HomeContent {
  welcomeMessage: string;
  thankYouMessage: string;
  continueReading?: { book: BookSummary; progress: ReadingProgress };
  latest?: BookSummary;
  upcoming?: BookSummary;
  libraryPreview: BookSummary[];
  youtubePreview?: YoutubeAsset;
  author: { name: string; bioSnippet: string; photoUrl: string };
}

export const normalizeHomeContent = (value: Partial<HomeContent>): HomeContent => ({
  welcomeMessage: value.welcomeMessage || '',
  thankYouMessage: value.thankYouMessage || '',
  libraryPreview: Array.isArray(value.libraryPreview) ? value.libraryPreview : [],
  ...(value.continueReading ? { continueReading: value.continueReading } : {}),
  ...(value.latest ? { latest: value.latest } : {}),
  ...(value.upcoming ? { upcoming: value.upcoming } : {}),
  ...(value.youtubePreview ? { youtubePreview: value.youtubePreview } : {}),
  author: value.author || { name: '', bioSnippet: '', photoUrl: '' },
});

export const contentService = {
  getBootstrap: async () => (await api.get('/app/bootstrap')).data,
  getHome: async (): Promise<HomeContent> => normalizeHomeContent((await api.get<Partial<HomeContent>>('/home')).data),
  getAuthor: async (): Promise<AuthorContent> => (await api.get('/content/author')).data,
  getContact: async (): Promise<ContactContent> => (await api.get('/content/contact')).data,
  getAboutApp: async (): Promise<{ content: string }> => (await api.get('/content/about-app')).data,
  getQRCodes: async (): Promise<YoutubeAsset[]> => (await api.get<CursorPage<YoutubeAsset>>('/youtube-assets')).data.items,
  getYoutubeAsset: async (bookId: string): Promise<YoutubeAsset> => (await api.get(`/books/${bookId}/youtube-asset`)).data,
};
