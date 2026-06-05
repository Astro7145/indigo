import type { JSONContent } from '@tiptap/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import NoteEditor from './NoteEditor';

const emptyDoc: JSONContent = { type: 'doc', content: [] };

it('툴바와 contenteditable 입력 영역을 함께 렌더한다', () => {
  const { container } = render(<NoteEditor value={emptyDoc} onChange={() => {}} />);

  expect(screen.getByRole('button', { name: '굵게' })).toBeInTheDocument();
  expect(container.querySelector('[contenteditable="true"]')).toBeInTheDocument();
});

it('이미지 삽입 버튼은 렌더되지 않는다', () => {
  render(<NoteEditor value={emptyDoc} onChange={() => {}} />);

  expect(screen.queryByRole('button', { name: '이미지 삽입' })).not.toBeInTheDocument();
});

it('링크 삽입 버튼은 렌더되고 클릭 시 onLinkInsertClick이 호출된다', () => {
  const onLinkInsertClick = jest.fn();
  render(<NoteEditor value={emptyDoc} onChange={() => {}} onLinkInsertClick={onLinkInsertClick} />);

  fireEvent.click(screen.getByRole('button', { name: '링크 삽입' }));

  expect(onLinkInsertClick).toHaveBeenCalledTimes(1);
});

it('초기 value의 JSON이 에디터에 렌더된다', () => {
  const doc: JSONContent = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '안녕하세요' }] }],
  };
  const { container } = render(<NoteEditor value={doc} onChange={() => {}} />);

  const editor = container.querySelector('[contenteditable="true"]');
  expect(editor?.textContent).toContain('안녕하세요');
});

it('value가 비어있는 상태로 마운트된 뒤 외부에서 JSON이 도착하면 에디터에 반영된다', async () => {
  // 수정 페이지의 비동기 hydration 시나리오: useEditor.content는 마운트 시점에만 소비되므로
  // value prop이 나중에 바뀌어도 에디터가 갱신되도록 sync 로직이 필요하다
  const { container, rerender } = render(<NoteEditor value={emptyDoc} onChange={() => {}} />);

  const arrived: JSONContent = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '나중에 도착한 본문' }] }],
  };
  rerender(<NoteEditor value={arrived} onChange={() => {}} />);

  await waitFor(() => {
    const editor = container.querySelector('[contenteditable="true"]');
    expect(editor?.textContent).toContain('나중에 도착한 본문');
  });
});

it('value가 비어있으면 placeholder가 DOM에 표시된다', () => {
  const { container } = render(
    <NoteEditor value={emptyDoc} onChange={() => {}} placeholder="이 곳을 통해 내용을 작성하세요" />,
  );

  const placeholderEl = container.querySelector('[data-placeholder]');
  expect(placeholderEl?.getAttribute('data-placeholder')).toBe('이 곳을 통해 내용을 작성하세요');
});
