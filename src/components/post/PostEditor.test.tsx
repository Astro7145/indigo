import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import PostEditor from './PostEditor';

it('툴바와 contenteditable 입력 영역을 함께 렌더한다', () => {
  const { container } = render(<PostEditor value="" onChange={() => {}} />);

  expect(screen.getByRole('button', { name: '굵게' })).toBeInTheDocument();
  expect(container.querySelector('[contenteditable="true"]')).toBeInTheDocument();
});

it('이미지 버튼 클릭 시 onImageClick이 호출된다', () => {
  const onImageClick = jest.fn();
  render(<PostEditor value="" onChange={() => {}} onImageClick={onImageClick} />);

  fireEvent.click(screen.getByRole('button', { name: '이미지 삽입' }));

  expect(onImageClick).toHaveBeenCalledTimes(1);
});

it('초기 value의 HTML이 에디터에 렌더된다', () => {
  const { container } = render(<PostEditor value="<p>안녕하세요</p>" onChange={() => {}} />);

  const editor = container.querySelector('[contenteditable="true"]');
  expect(editor?.textContent).toContain('안녕하세요');
});

it('value가 빈 상태로 마운트된 뒤 외부에서 HTML이 도착하면 에디터에 반영된다', async () => {
  // 수정 페이지의 비동기 hydration 시나리오: useEditor.content는 마운트 시점에만 소비되므로
  // value prop이 나중에 바뀌어도 에디터가 갱신되도록 sync 로직이 필요하다
  const { container, rerender } = render(<PostEditor value="" onChange={() => {}} />);

  rerender(<PostEditor value="<p>나중에 도착한 본문</p>" onChange={() => {}} />);

  await waitFor(() => {
    const editor = container.querySelector('[contenteditable="true"]');
    expect(editor?.textContent).toContain('나중에 도착한 본문');
  });
});

it('게시글 작성에는 링크 버튼이 렌더되지 않는다', () => {
  render(<PostEditor value="" onChange={() => {}} />);

  expect(screen.queryByRole('button', { name: '링크 삽입' })).not.toBeInTheDocument();
});

it('value가 비어있으면 placeholder가 DOM에 표시된다', () => {
  const { container } = render(
    <PostEditor value="" onChange={() => {}} placeholder="이 곳을 통해 내용을 작성해주세요" />,
  );

  const placeholderEl = container.querySelector('[data-placeholder]');
  expect(placeholderEl?.getAttribute('data-placeholder')).toBe('이 곳을 통해 내용을 작성해주세요');
});
