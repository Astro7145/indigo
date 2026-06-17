/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/link-preview/route';

function req(url?: string) {
  const qs = url ? `?url=${encodeURIComponent(url)}` : '';
  return new NextRequest(`http://localhost/api/link-preview${qs}`);
}

function mockFetchOnce(html: string, contentType = 'text/html') {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    headers: { get: (k: string) => (k.toLowerCase() === 'content-type' ? contentType : null) },
    text: () => Promise.resolve(html),
  }) as unknown as typeof fetch;
}

afterEach(() => {
  jest.restoreAllMocks();
});

it('og:title과 favicon 링크를 추출한다', async () => {
  mockFetchOnce(`
    <html><head>
      <meta property="og:title" content="예시 페이지" />
      <link rel="icon" href="https://example.com/icon.png" />
    </head></html>
  `);
  const res = await GET(req('https://example.com/page'));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ title: '예시 페이지', faviconUrl: 'https://example.com/icon.png' });
});

it('og:title이 없으면 <title>을 사용한다', async () => {
  mockFetchOnce('<html><head><title>일반 제목</title></head></html>');
  const res = await GET(req('https://example.com/page'));
  expect(await res.json()).toEqual({ title: '일반 제목', faviconUrl: 'https://example.com/favicon.ico' });
});

it('상대경로 favicon을 절대경로로 변환한다', async () => {
  mockFetchOnce('<html><head><link rel="shortcut icon" href="/static/icon.ico" /></head></html>');
  const res = await GET(req('https://example.com/sub/page'));
  expect(await res.json()).toEqual({ title: null, faviconUrl: 'https://example.com/static/icon.ico' });
});

it('favicon 링크가 없으면 /favicon.ico를 기본값으로 사용한다', async () => {
  mockFetchOnce('<html><head></head></html>');
  const res = await GET(req('https://example.com/page'));
  expect(await res.json()).toEqual({ title: null, faviconUrl: 'https://example.com/favicon.ico' });
});

it('url 파라미터가 없으면 400을 반환한다', async () => {
  const res = await GET(req());
  expect(res.status).toBe(400);
});

it('http/https가 아닌 프로토콜이면 400을 반환한다', async () => {
  const res = await GET(req('javascript:alert(1)'));
  expect(res.status).toBe(400);
});

it('사설 호스트(localhost)면 400을 반환한다', async () => {
  const res = await GET(req('http://localhost:3000/x'));
  expect(res.status).toBe(400);
});

it('사설 호스트(192.168.x)면 400을 반환한다', async () => {
  const res = await GET(req('http://192.168.0.1/x'));
  expect(res.status).toBe(400);
});

it('외부 fetch가 실패하면 null 필드와 함께 200을 반환한다', async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error('network error')) as unknown as typeof fetch;
  const res = await GET(req('https://example.com/page'));
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ title: null, faviconUrl: null });
});

it('content-type이 html이 아니면 null 필드를 반환한다', async () => {
  mockFetchOnce('not html', 'application/json');
  const res = await GET(req('https://example.com/page'));
  expect(await res.json()).toEqual({ title: null, faviconUrl: null });
});
