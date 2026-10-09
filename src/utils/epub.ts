import { Buffer } from '@craftzdog/react-native-buffer';
import { strFromU8, unzipSync } from 'fflate';

export interface ParsedEpubResource { id: string; href: string; html: string }
export interface ParsedEpub { title: string; resources: ParsedEpubResource[]; spine: string[] }

const dirname = (path: string) => path.includes('/') ? path.slice(0, path.lastIndexOf('/') + 1) : '';
const normalizePath = (path: string) => {
  const parts: string[] = [];
  path.split('/').forEach(part => {
    if (!part || part === '.') return;
    if (part === '..') parts.pop(); else parts.push(part);
  });
  return parts.join('/');
};
const attr = (source: string, name: string) => new RegExp(`${name}=["']([^"']+)["']`, 'i').exec(source)?.[1];

export const parseEpub = (epubBytes: Uint8Array): ParsedEpub => {
  const files = unzipSync(epubBytes);
  const container = files['META-INF/container.xml'];
  if (!container) throw new Error('EPUB container is missing.');
  const rootPath = attr(strFromU8(container), 'full-path');
  if (!rootPath || !files[rootPath]) throw new Error('EPUB package document is missing.');
  const opf = strFromU8(files[rootPath]);
  const rootDir = dirname(rootPath);
  const title = /<dc:title[^>]*>([\s\S]*?)<\/dc:title>/i.exec(opf)?.[1]?.trim() || 'MOSTLYVERS';

  const manifest = new Map<string, { href: string; mediaType: string }>();
  for (const match of opf.matchAll(/<item\s+[^>]*\/?\s*>/gi)) {
    const id = attr(match[0], 'id');
    const href = attr(match[0], 'href');
    if (id && href) manifest.set(id, { href: normalizePath(rootDir + href), mediaType: attr(match[0], 'media-type') || '' });
  }
  const spine = [...opf.matchAll(/<itemref\s+[^>]*\/?\s*>/gi)].map(match => attr(match[0], 'idref')).filter(Boolean) as string[];

  const resources = spine.map(id => {
    const item = manifest.get(id);
    if (!item || !files[item.href]) throw new Error(`EPUB spine resource ${id} is missing.`);
    let html = strFromU8(files[item.href]);
    const resourceDir = dirname(item.href);
    html = html.replace(/(<(?:img|image)[^>]+(?:src|href)=["'])([^"']+)(["'])/gi, (all, start, value, end) => {
      if (/^(data:|https?:|#)/i.test(value)) return all;
      const assetPath = normalizePath(resourceDir + value.split('#')[0]);
      const asset = files[assetPath];
      if (!asset) return all;
      const mediaType = [...manifest.values()].find(entry => entry.href === assetPath)?.mediaType || 'application/octet-stream';
      return `${start}data:${mediaType};base64,${Buffer.from(asset).toString('base64')}${end}`;
    });
    return { id, href: item.href, html };
  });
  return { title, resources, spine };
};
