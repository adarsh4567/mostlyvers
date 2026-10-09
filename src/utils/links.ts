export const getSafeHttpsUrl = (value?: string, allowedHosts?: string[]): string | null => {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if (allowedHosts && !allowedHosts.includes(url.hostname.toLowerCase())) return null;
    return url.toString();
  } catch { return null; }
};

export const getSafeYoutubeUrl = (value?: string) => getSafeHttpsUrl(value, [
  'youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be',
]);

export const getMailtoUrl = (email?: string): string | null => {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return `mailto:${encodeURIComponent(email)}`;
};
