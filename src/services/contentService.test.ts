import { normalizeHomeContent } from './contentService';

describe('normalizeHomeContent', () => {
  it('supplies an empty author preview when an older Home response omits it', () => {
    const home = normalizeHomeContent({
      welcomeMessage: 'Welcome',
      thankYouMessage: 'Thank you',
      libraryPreview: [],
    });

    expect(home.author).toEqual({ name: '', bioSnippet: '', photoUrl: '' });
  });
});
