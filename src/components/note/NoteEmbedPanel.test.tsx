import { fireEvent, render, screen } from '@testing-library/react';

import NoteEmbedPanel from './NoteEmbedPanel';

it('open=false이면 aria-hidden=true로 렌더된다', () => {
  render(<NoteEmbedPanel open={false} onClose={() => {}} />);

  expect(screen.getByLabelText('링크 임베드 패널')).toHaveAttribute('aria-hidden', 'true');
});

it('open=true이면 aria-hidden=false로 렌더된다', () => {
  render(<NoteEmbedPanel open={true} onClose={() => {}} />);

  expect(screen.getByLabelText('링크 임베드 패널')).toHaveAttribute('aria-hidden', 'false');
});

it('확장 토글 버튼 클릭 시 onToggleExpand가 호출된다', () => {
  const onToggleExpand = jest.fn();
  render(<NoteEmbedPanel open={true} onClose={() => {}} onToggleExpand={onToggleExpand} />);

  fireEvent.click(screen.getByRole('button', { name: '패널 확장' }));
  expect(onToggleExpand).toHaveBeenCalledTimes(1);
});

it('expanded=true이면 축소 라벨로 토글 버튼이 렌더된다', () => {
  render(<NoteEmbedPanel open={true} onClose={() => {}} expanded onToggleExpand={() => {}} />);

  expect(screen.getByRole('button', { name: '패널 축소' })).toBeInTheDocument();
});

it('data가 없으면 placeholder 문구를 표시한다', () => {
  render(<NoteEmbedPanel open={true} onClose={() => {}} />);

  expect(screen.getByText('여기에 임베드가 표시됩니다')).toBeInTheDocument();
});

it('data.type=iframe이면 iframe을 렌더한다', () => {
  const { container } = render(
    <NoteEmbedPanel open={true} onClose={() => {}} data={{ type: 'iframe', url: 'https://x' }} />,
  );

  const iframe = container.querySelector('iframe');
  expect(iframe).toBeInTheDocument();
  expect(iframe?.getAttribute('src')).toBe('https://x');
});

it('data.type=metadata이면 OG 정보와 링크를 표시한다', () => {
  render(
    <NoteEmbedPanel
      open={true}
      onClose={() => {}}
      data={{
        type: 'metadata',
        url: 'https://example.com',
        title: '예시 페이지',
        description: '설명입니다',
      }}
    />,
  );

  expect(screen.getByText('예시 페이지')).toBeInTheDocument();
  expect(screen.getByText('설명입니다')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'https://example.com' })).toBeInTheDocument();
});

it('expanded=false이면 쉐브론에 rotate-90 xl:rotate-0 클래스가 적용된다', () => {
  const { container } = render(<NoteEmbedPanel open={true} onClose={() => {}} expanded={false} />);
  const svg = container.querySelector('svg');
  expect(svg).toHaveClass('rotate-90', 'xl:rotate-0');
});

it('expanded=true이면 쉐브론에 -rotate-90 xl:rotate-180 클래스가 적용된다', () => {
  const { container } = render(<NoteEmbedPanel open={true} onClose={() => {}} expanded={true} />);
  const svg = container.querySelector('svg');
  expect(svg).toHaveClass('-rotate-90', 'xl:rotate-180');
});

it('닫기 버튼 클릭 시 onClose가 호출된다', () => {
  const onClose = jest.fn();
  render(<NoteEmbedPanel open={true} onClose={onClose} />);

  fireEvent.click(screen.getByRole('button', { name: '패널 닫기' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});
