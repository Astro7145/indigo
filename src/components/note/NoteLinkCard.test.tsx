import { fireEvent, render, screen } from '@testing-library/react';

import NoteLinkCard from './NoteLinkCard';

it('제목·URL을 렌더하고 본체 클릭 시 onClick이 호출된다', () => {
  const onClick = jest.fn();
  render(
    <NoteLinkCard
      url="https://example.com/abc"
      title="자바스크립트 기초 챕터1"
      onClick={onClick}
      onDelete={() => {}}
    />,
  );

  expect(screen.getByText('자바스크립트 기초 챕터1')).toBeInTheDocument();
  expect(screen.getByText('https://example.com/abc')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '링크 미리보기 열기' }));
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('title이 없으면 URL을 제목 자리에 표시한다', () => {
  render(<NoteLinkCard url="https://example.com/x" onClick={() => {}} onDelete={() => {}} />);

  const titles = screen.getAllByText('https://example.com/x');
  expect(titles.length).toBeGreaterThanOrEqual(1);
});

it('X 버튼 클릭 시 onDelete가 호출된다', () => {
  const onDelete = jest.fn();
  render(<NoteLinkCard url="https://x" onClick={() => {}} onDelete={onDelete} />);

  fireEvent.click(screen.getByRole('button', { name: '링크 삭제' }));
  expect(onDelete).toHaveBeenCalledTimes(1);
});
