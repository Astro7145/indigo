import { act, renderHook } from '@testing-library/react';
import type { ReactElement } from 'react';

import ImageLightbox from '@/src/components/common/ImageLightbox';
import { useImageLightbox } from '@/src/hooks/useImageLightbox';
import { useModalStore } from '@/src/stores/modal';

beforeEach(() => {
  useModalStore.setState({ modals: [] });
});

it('호출하면 modal 스택에 modal variant 엔트리가 push된다', () => {
  const { result } = renderHook(() => useImageLightbox());
  act(() => result.current('https://example.com/a.png', '첨부 이미지'));

  const modals = useModalStore.getState().modals;
  expect(modals).toHaveLength(1);
  expect(modals[0].variant).toBe('modal');
});

it('등록된 엔트리는 ImageLightbox를 src/alt 그대로 렌더한다', () => {
  const { result } = renderHook(() => useImageLightbox());
  act(() => result.current('https://example.com/b.png', '두번째'));

  const entry = useModalStore.getState().modals[0];
  const element = entry.render({ close: jest.fn(), closeWithParent: jest.fn() }) as ReactElement<{
    src: string;
    alt?: string;
  }>;
  expect(element.type).toBe(ImageLightbox);
  expect(element.props.src).toBe('https://example.com/b.png');
  expect(element.props.alt).toBe('두번째');
});
