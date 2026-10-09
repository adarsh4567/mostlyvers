import api, { createIdempotencyKey } from './api';
import { BillingProvider, CheckoutPurpose, CheckoutSession, CursorPage, Transaction } from '../types/api';
import { getDeviceContext } from '../utils/deviceInfo';

type CheckoutRequest = { purpose: CheckoutPurpose; provider: BillingProvider; bookId?: string; deviceId: string; externalTransactionToken?: string };
type PlayProof = { provider: 'GOOGLE_PLAY'; productId: string; purchaseToken: string };
type AlternativeProof = { provider: 'ALTERNATIVE'; orderId: string; paymentId: string; signature: string; externalTransactionToken: string };

export const purchaseService = {
  createCheckout: async (request: CheckoutRequest): Promise<CheckoutSession> => {
    const device = await getDeviceContext();
    return (await api.post<CheckoutSession>('/checkouts', {
      ...request,
      integrityToken: device.integrityToken,
      integrityRequestHash: device.integrityRequestHash,
    }, { headers: { 'Idempotency-Key': createIdempotencyKey() } })).data;
  },
  confirmCheckout: async (id: string, proof: PlayProof | AlternativeProof): Promise<CheckoutSession> =>
    (await api.post<CheckoutSession>(`/checkouts/${id}/confirm`, proof, { headers: { 'Idempotency-Key': createIdempotencyKey() } })).data,
  getCheckout: async (id: string): Promise<CheckoutSession> => (await api.get<CheckoutSession>(`/checkouts/${id}`)).data,
  reconcilePlayPurchases: async (purchases: Array<{ productId: string; purchaseToken: string }>) =>
    (await api.post('/billing/google-play/reconcile', { purchases }, { headers: { 'Idempotency-Key': createIdempotencyKey() } })).data,
  getTransactions: async (cursor?: string, type?: string): Promise<CursorPage<Transaction>> =>
    (await api.get('/me/transactions', { params: { cursor, type } })).data,
	claimBook: async (bookId: string): Promise<import('../types/api').BookSummary> =>
		(await api.post(`/books/${bookId}/claim`, undefined, { headers: { 'Idempotency-Key': createIdempotencyKey() } })).data,
	prebookFree: async (bookId: string): Promise<import('../types/api').BookSummary> =>
		(await api.post(`/books/${bookId}/prebook`, undefined, { headers: { 'Idempotency-Key': createIdempotencyKey() } })).data,
};
