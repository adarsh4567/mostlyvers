import api, { createIdempotencyKey } from './api';
import { Feedback } from '../types/api';

export const feedbackService = {
  getMyFeedback: async (bookId: string): Promise<Feedback | null> => {
    try { return (await api.get<Feedback>(`/me/books/${bookId}/feedback`)).data; }
    catch (error: any) { if (error?.status === 404) return null; throw error; }
  },
  submitFeedback: async (bookId: string, text: string): Promise<Feedback> =>
    (await api.post(`/me/books/${bookId}/feedback`, { text }, { headers: { 'Idempotency-Key': createIdempotencyKey() } })).data,
  updateFeedback: async (bookId: string, text: string): Promise<Feedback> =>
    (await api.patch(`/me/books/${bookId}/feedback`, { text })).data,
};
