import { runWithTransientRetry } from './transientRetry';

describe('runWithTransientRetry', () => {
  it('retries a login once when a sleeping backend drops the first request', async () => {
    const request = jest
      .fn<Promise<string>, []>()
      .mockRejectedValueOnce({ code: 'NETWORK_ERROR' })
      .mockResolvedValueOnce('session');

    await expect(
      runWithTransientRetry(request, { wait: () => Promise.resolve() }),
    ).resolves.toBe('session');
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('retries temporary gateway errors from a waking Render service', async () => {
    const request = jest
      .fn<Promise<string>, []>()
      .mockRejectedValueOnce({ code: 'SERVICE_UNAVAILABLE', status: 503 })
      .mockResolvedValueOnce('session');

    await expect(
      runWithTransientRetry(request, { wait: () => Promise.resolve() }),
    ).resolves.toBe('session');
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('does not retry invalid credentials', async () => {
    const invalidCredentials = { code: 'INVALID_CREDENTIALS', status: 401 };
    const request = jest.fn<Promise<string>, []>().mockRejectedValue(invalidCredentials);

    await expect(
      runWithTransientRetry(request, { wait: () => Promise.resolve() }),
    ).rejects.toBe(invalidCredentials);
    expect(request).toHaveBeenCalledTimes(1);
  });
});
