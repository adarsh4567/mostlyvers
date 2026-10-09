import api, { createIdempotencyKey } from './api';
import { CheckoutSession, DeviceAccess } from '../types/api';
import { getDeviceContext } from '../utils/deviceInfo';

export const deviceService = {
  getMyDevices: async (): Promise<DeviceAccess> => (await api.get('/me/device-access')).data,
  createTransferCheckout: async (provider: 'GOOGLE_PLAY' | 'ALTERNATIVE'): Promise<CheckoutSession> =>
    (await api.post('/me/device-transfer/checkouts', { provider, device: await getDeviceContext() }, {
      headers: { 'Idempotency-Key': createIdempotencyKey() },
    })).data,
  getTransferCheckout: async (id: string): Promise<CheckoutSession> =>
    (await api.get(`/me/device-transfer/checkouts/${id}`)).data,
	transferFree: async (): Promise<DeviceAccess> =>
		(await api.post('/me/device-transfer/free', undefined, { headers: { 'Idempotency-Key': createIdempotencyKey() } })).data,
};
