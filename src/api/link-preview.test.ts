jest.mock('@/src/api/client-fetcher');
import instance from '@/src/api/client-fetcher';
import { getLinkPreview, linkPreviewKeys } from '@/src/api/link-preview';

const mocked = instance as jest.Mocked<typeof instance>;
beforeEach(() => {
  jest.resetAllMocks();
  mocked.get.mockResolvedValue({ data: { title: 't', faviconUrl: 'f' } } as never);
});

it('getLinkPreview는 url과 함께 GET /link-preview를 호출한다', async () => {
  const r = await getLinkPreview('https://example.com');
  expect(mocked.get).toHaveBeenCalledWith('/link-preview', { params: { url: 'https://example.com' } });
  expect(r).toEqual({ title: 't', faviconUrl: 'f' });
});

it('linkPreviewKeys 팩토리는 안정적인 키를 생성한다', () => {
  expect(linkPreviewKeys.detail('https://example.com')).toEqual(['link-preview', 'https://example.com']);
});
