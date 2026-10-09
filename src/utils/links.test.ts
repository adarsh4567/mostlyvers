import { getMailtoUrl, getSafeHttpsUrl, getSafeYoutubeUrl } from './links';

describe('outbound link validation', () => {
  it('permits only HTTPS YouTube hosts', () => {
    expect(getSafeYoutubeUrl('https://youtu.be/abc')).toBe('https://youtu.be/abc');
    expect(getSafeYoutubeUrl('http://youtube.com/watch?v=abc')).toBeNull();
    expect(getSafeYoutubeUrl('https://youtube.com.evil.test/watch?v=abc')).toBeNull();
  });
  it('restricts social hosts and validates email links', () => {
    expect(getSafeHttpsUrl('https://www.instagram.com/mostlyvers', ['www.instagram.com'])).toBeTruthy();
    expect(getMailtoUrl('reader@example.com')).toBe('mailto:reader%40example.com');
    expect(getMailtoUrl('not-an-email')).toBeNull();
  });
});
