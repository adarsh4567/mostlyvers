import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { AxiosRequestConfig } from 'axios';
import api, { ApiError, toApiError } from '../services/api';
import { BookSummary, CursorPage, DeviceAccess, DownloadRecord, Feedback, NotificationPage, Transaction, YoutubeAsset } from '../types/api';

type QueryArgs = { url: string; method?: AxiosRequestConfig['method']; data?: unknown; params?: unknown };
const axiosBaseQuery: BaseQueryFn<QueryArgs, unknown, ApiError> = async ({ url, method = 'GET', data, params }) => {
  try {
    const result = await api({ url, method, data, params });
    return { data: result.data };
  } catch (error) { return { error: toApiError(error) }; }
};

export const readerApi = createApi({
  reducerPath: 'readerApi', baseQuery: axiosBaseQuery,
	tagTypes: ['Books', 'Me', 'Device', 'Downloads', 'Feedback', 'Transactions', 'Youtube', 'Notifications'],
  endpoints: builder => ({
    getBooks: builder.query<CursorPage<BookSummary>, { query?: string; cursor?: string; limit?: number }>({
      query: params => ({ url: '/books', params }), providesTags: ['Books'],
    }),
    getBook: builder.query<BookSummary, string>({ query: id => ({ url: `/books/${id}` }), providesTags: ['Books'] }),
    getDeviceAccess: builder.query<DeviceAccess, void>({ query: () => ({ url: '/me/device-access' }), providesTags: ['Device'] }),
    getDownloads: builder.query<CursorPage<DownloadRecord>, void>({ query: () => ({ url: '/me/downloads' }), providesTags: ['Downloads'] }),
    getTransactions: builder.query<CursorPage<Transaction>, { cursor?: string; type?: string }>({
      query: params => ({ url: '/me/transactions', params }), providesTags: ['Transactions'],
    }),
    getYoutubeAssets: builder.query<CursorPage<YoutubeAsset>, void>({ query: () => ({ url: '/youtube-assets' }), providesTags: ['Youtube'] }),
    getFeedback: builder.query<Feedback | null, string>({
      query: bookId => ({ url: `/me/books/${bookId}/feedback` }), providesTags: ['Feedback'],
    }),
	getNotifications: builder.query<NotificationPage, void>({ query: () => ({ url: '/me/notifications' }), providesTags: ['Notifications'] }),
	readNotification: builder.mutation<void, string>({ query: id => ({ url: `/me/notifications/${id}/read`, method: 'POST' }), invalidatesTags: ['Notifications'] }),
	readAllNotifications: builder.mutation<void, void>({ query: () => ({ url: '/me/notifications/read-all', method: 'POST' }), invalidatesTags: ['Notifications'] }),
  }),
});

export const { useGetNotificationsQuery, useReadNotificationMutation, useReadAllNotificationsMutation } = readerApi;
