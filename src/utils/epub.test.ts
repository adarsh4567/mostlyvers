import { strToU8, zipSync } from 'fflate';
import { parseEpub } from './epub';

describe('EPUB parser', () => {
  it('finds package metadata and preserves spine order', () => {
    const archive = zipSync({
      'META-INF/container.xml': strToU8('<?xml version="1.0"?><container><rootfiles><rootfile full-path="OPS/book.opf"/></rootfiles></container>'),
      'OPS/book.opf': strToU8('<?xml version="1.0"?><package><metadata><dc:title>Test Story</dc:title></metadata><manifest><item id="one" href="one.xhtml" media-type="application/xhtml+xml"/><item id="two" href="two.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="one"/><itemref idref="two"/></spine></package>'),
      'OPS/one.xhtml': strToU8('<html><head></head><body>One</body></html>'),
      'OPS/two.xhtml': strToU8('<html><head></head><body>Two</body></html>'),
    });
    const parsed = parseEpub(archive);
    expect(parsed.title).toBe('Test Story');
    expect(parsed.spine).toEqual(['one', 'two']);
    expect(parsed.resources[1].html).toContain('Two');
  });
});
