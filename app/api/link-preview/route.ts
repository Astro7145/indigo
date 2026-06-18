import { NextResponse, type NextRequest } from 'next/server';
import type { LinkPreview } from '@/src/types/note';

const NULL_PREVIEW: LinkPreview = { title: null, faviconUrl: null };

// 사설/루프백 호스트 차단 (SSRF 기본 방어).
function isPrivateHost(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '0.0.0.0' || hostname === '::1') return true;
  if (/^127\./.test(hostname)) return true;
  if (/^10\./.test(hostname)) return true;
  if (/^192\.168\./.test(hostname)) return true;
  if (/^169\.254\./.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true;
  return false;
}

function extractTitle(html: string): string | null {
  const og =
    html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']*)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]*property=["']og:title["']/i);
  if (og) return og[1];
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return title ? title[1].trim() : null;
}

function extractFaviconHref(html: string): string | null {
  const icon =
    html.match(/<link[^>]+rel=["'](?:shortcut icon|icon)["'][^>]*href=["']([^"']+)["']/i) ??
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["'](?:shortcut icon|icon)["']/i);
  return icon ? icon[1] : null;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const urlParam = req.nextUrl.searchParams.get('url');
  if (!urlParam) {
    return NextResponse.json({ message: 'url is required' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return NextResponse.json({ message: 'Invalid url' }, { status: 400 });
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return NextResponse.json({ message: 'Invalid url' }, { status: 400 });
  }
  if (isPrivateHost(target.hostname)) {
    return NextResponse.json({ message: 'Invalid url' }, { status: 400 });
  }

  try {
    const res = await fetch(target, {
      signal: AbortSignal.timeout(5000),
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; INdigoLinkPreview/1.0)' },
    });
    const contentType = res.headers.get('content-type') ?? '';
    if (!res.ok || !contentType.includes('text/html')) {
      return NextResponse.json(NULL_PREVIEW);
    }
    const html = await res.text();
    const title = extractTitle(html);
    const faviconHref = extractFaviconHref(html) ?? '/favicon.ico';
    const faviconUrl = new URL(faviconHref, target).toString();
    return NextResponse.json({ title, faviconUrl } satisfies LinkPreview);
  } catch {
    return NextResponse.json(NULL_PREVIEW);
  }
}
