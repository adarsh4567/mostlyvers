import { shouldUseBookCoverPlaceholder } from './BookCover';

test('missing and blank cover URLs use the branded title placeholder', () => {
  expect(shouldUseBookCoverPlaceholder(undefined)).toBe(true);
  expect(shouldUseBookCoverPlaceholder('   ')).toBe(true);
  expect(shouldUseBookCoverPlaceholder('https://images.example.test/book.jpg')).toBe(false);
});
