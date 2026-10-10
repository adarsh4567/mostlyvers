type RetryOptions = {
  attempts?: number;
  delayMs?: number;
  wait?: (delayMs: number) => Promise<void>;
};

type RetryableError = {
  code?: string;
  status?: number;
};

const sleep = (delayMs: number) => new Promise<void>((resolve) => setTimeout(resolve, delayMs));

const isTransient = (error: unknown): boolean => {
  const candidate = error as RetryableError | null;
  if (!candidate) return false;
  if (candidate.code === 'NETWORK_ERROR') return true;
  return candidate.status === 502 || candidate.status === 503 || candidate.status === 504;
};

/** Retry only failures that can be caused by a free Render service waking up. */
export const runWithTransientRetry = async <T>(
  request: () => Promise<T>,
  { attempts = 2, delayMs = 1_500, wait = sleep }: RetryOptions = {},
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      if (attempt === attempts || !isTransient(error)) throw error;
      await wait(delayMs);
    }
  }

  throw lastError;
};
