import { render, screen } from '@testing-library/react';
import ErrorBoundary from '@/src/components/common/ErrorBoundary';

function Boom(): never {
  throw new Error('boom');
}

beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterEach(() => (console.error as jest.Mock).mockRestore());

it('자식이 정상이면 자식을 렌더한다', () => {
  render(
    <ErrorBoundary fallback={<span>에러</span>}>
      <span>정상</span>
    </ErrorBoundary>,
  );
  expect(screen.getByText('정상')).toBeInTheDocument();
});

it('자식이 throw하면 fallback을 렌더한다', () => {
  render(
    <ErrorBoundary fallback={<span>에러</span>}>
      <Boom />
    </ErrorBoundary>,
  );
  expect(screen.getByText('에러')).toBeInTheDocument();
});
