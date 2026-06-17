jest.mock('@/src/api/link-preview', () => ({
  ...jest.requireActual('@/src/api/link-preview'),
  getLinkPreview: jest.fn(),
}));
import * as linkPreviewApi from '@/src/api/link-preview';
import { waitFor } from '@testing-library/react';
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils';
import { useLinkPreview } from '@/src/hooks/note/useLinkPreview';

const mocked = linkPreviewApi as jest.Mocked<typeof linkPreviewApi>;

beforeEach(() => {
  jest.resetAllMocks();
});

it('url이 주어지면 getLinkPreview를 호출한다', async () => {
  mocked.getLinkPreview.mockResolvedValue({ title: 't', faviconUrl: 'f' });
  const { result } = renderHookWithClient(() => useLinkPreview('https://example.com'));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(mocked.getLinkPreview).toHaveBeenCalledWith('https://example.com');
  expect(result.current.data).toEqual({ title: 't', faviconUrl: 'f' });
});

it('url이 null이면 getLinkPreview를 호출하지 않는다', () => {
  renderHookWithClient(() => useLinkPreview(null));
  expect(mocked.getLinkPreview).not.toHaveBeenCalled();
});
