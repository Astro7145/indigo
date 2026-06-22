jest.mock('@/src/api/link-preview', () => ({
  ...jest.requireActual('@/src/api/link-preview'),
  getLinkPreview: jest.fn(),
}));
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { Suspense, type ReactNode } from 'react';

import * as linkPreviewApi from '@/src/api/link-preview';
import { createTestQueryClient } from '@/src/hooks/__tests__/test-utils';
import { useLinkPreviewSuspense } from '@/src/hooks/note/useLinkPreview';

const mocked = linkPreviewApi as jest.Mocked<typeof linkPreviewApi>;

beforeEach(() => {
  jest.resetAllMocks();
});

it('url로 getLinkPreview를 호출해 프리뷰를 반환한다', async () => {
  mocked.getLinkPreview.mockResolvedValue({ title: 't', faviconUrl: 'f' });
  const client = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <Suspense fallback={null}>{children}</Suspense>
    </QueryClientProvider>
  );

  const { result } = renderHook(() => useLinkPreviewSuspense('https://example.com'), { wrapper });

  await waitFor(() => expect(result.current.data).toEqual({ title: 't', faviconUrl: 'f' }));
  expect(mocked.getLinkPreview).toHaveBeenCalledWith('https://example.com');
});
