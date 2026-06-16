import type { JSONContent } from '@tiptap/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import NoteContentEditor from './NoteContentEditor';

const emptyDoc: JSONContent = { type: 'doc', content: [] };
const filledDoc: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: '안녕하세요' }] }],
};

it('편집 가능 모드에서 툴바와 입력 영역을 함께 보여준다', () => {
  const { container } = render(<NoteContentEditor value={emptyDoc} onChange={() => {}} />);

  expect(screen.getByRole('button', { name: '굵게' })).toBeInTheDocument();
  expect(container.querySelector('[contenteditable="true"]')).toBeInTheDocument();
});

it('onLink가 없으면 링크 삽입 버튼이 보이지 않는다', () => {
  render(<NoteContentEditor value={emptyDoc} onChange={() => {}} />);

  expect(screen.queryByRole('button', { name: '링크 삽입' })).not.toBeInTheDocument();
});

it('이미지 삽입 버튼은 항상 보이지 않는다', () => {
  render(<NoteContentEditor value={emptyDoc} onChange={() => {}} />);

  expect(screen.queryByRole('button', { name: '이미지 삽입' })).not.toBeInTheDocument();
});

it('onLink가 있으면 링크 삽입 버튼이 보이고 클릭 시 onLink가 호출된다', () => {
  const onLink = jest.fn();
  render(<NoteContentEditor value={emptyDoc} onChange={() => {}} onLink={onLink} />);

  fireEvent.click(screen.getByRole('button', { name: '링크 삽입' }));

  expect(onLink).toHaveBeenCalledTimes(1);
});

it('읽기 전용 모드에서는 툴바 없이 본문만 보여준다', () => {
  const { container } = render(<NoteContentEditor value={filledDoc} editable={false} />);

  expect(screen.queryByRole('button', { name: '굵게' })).not.toBeInTheDocument();
  expect(container.querySelector('[contenteditable="false"]')).toBeInTheDocument();
  expect(container.textContent).toContain('안녕하세요');
});

it('초기 본문 JSON을 에디터에 그대로 보여준다', () => {
  const { container } = render(<NoteContentEditor value={filledDoc} onChange={() => {}} />);

  expect(container.querySelector('[contenteditable="true"]')?.textContent).toContain('안녕하세요');
});

it('마운트 후 외부에서 도착한 본문 JSON이 에디터에 반영된다', async () => {
  const { container, rerender } = render(<NoteContentEditor value={emptyDoc} onChange={() => {}} />);

  const arrived: JSONContent = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '나중에 도착한 본문' }] }],
  };
  rerender(<NoteContentEditor value={arrived} onChange={() => {}} />);

  await waitFor(() => {
    expect(container.querySelector('[contenteditable="true"]')?.textContent).toContain('나중에 도착한 본문');
  });
});

it('본문이 비어 있으면 placeholder가 DOM에 표시된다', () => {
  const { container } = render(
    <NoteContentEditor value={emptyDoc} onChange={() => {}} placeholder="이 곳을 통해 노트 작성을 시작해주세요" />,
  );

  expect(container.querySelector('[data-placeholder]')?.getAttribute('data-placeholder')).toBe(
    '이 곳을 통해 노트 작성을 시작해주세요',
  );
});
