import { render, screen } from '@testing-library/react';
import { use } from 'react';
import AsyncBoundary from '@/src/components/common/AsyncBoundary';

function Boom(): never {
  throw new Error('boom');
}

function Suspending() {
  use(new Promise(() => {})); // 영원히 pending → suspend
  return <span>resolved</span>;
}

beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterEach(() => (console.error as jest.Mock).mockRestore());

it('정상 자식을 렌더한다', () => {
  render(
    <AsyncBoundary fallback={<span>로딩</span>} errorFallback={<span>에러</span>}>
      <span>정상</span>
    </AsyncBoundary>,
  );
  expect(screen.getByText('정상')).toBeInTheDocument();
});

it('자식이 suspend하면 fallback을 렌더한다', () => {
  render(
    <AsyncBoundary fallback={<span>로딩</span>} errorFallback={<span>에러</span>}>
      <Suspending />
    </AsyncBoundary>,
  );
  expect(screen.getByText('로딩')).toBeInTheDocument();
});

it('자식이 throw하면 errorFallback을 렌더한다', () => {
  render(
    <AsyncBoundary fallback={<span>로딩</span>} errorFallback={<span>에러</span>}>
      <Boom />
    </AsyncBoundary>,
  );
  expect(screen.getByText('에러')).toBeInTheDocument();
});

it('resetKeys가 바뀌면 에러 상태를 초기화한다', () => {
  function Conditional({ shouldThrow }: { shouldThrow: boolean }) {
    if (shouldThrow) throw new Error('boom');
    return <span>복구됨</span>;
  }
  const { rerender } = render(
    <AsyncBoundary fallback={<span>로딩</span>} errorFallback={<span>에러</span>} resetKeys={[1]}>
      <Conditional shouldThrow />
    </AsyncBoundary>,
  );
  expect(screen.getByText('에러')).toBeInTheDocument();

  rerender(
    <AsyncBoundary fallback={<span>로딩</span>} errorFallback={<span>에러</span>} resetKeys={[2]}>
      <Conditional shouldThrow={false} />
    </AsyncBoundary>,
  );
  expect(screen.getByText('복구됨')).toBeInTheDocument();
});
