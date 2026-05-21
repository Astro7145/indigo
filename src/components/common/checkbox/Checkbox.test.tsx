import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';

import Checkbox from '@/src/components/common/checkbox/Checkbox';

it('기본은 미선택 상태로 렌더된다', () => {
  render(<Checkbox aria-label="동의" />);
  expect(screen.getByRole('checkbox')).not.toBeChecked();
});

it('클릭하면 토글된다 (uncontrolled)', () => {
  render(<Checkbox aria-label="동의" />);
  const input = screen.getByRole('checkbox');
  fireEvent.click(input);
  expect(input).toBeChecked();
});

it('controlled checked를 반영하고 클릭 시 onChange를 호출한다', () => {
  const onChange = jest.fn();
  render(<Checkbox aria-label="동의" checked onChange={onChange} />);
  const input = screen.getByRole('checkbox');
  expect(input).toBeChecked();
  fireEvent.click(input);
  expect(onChange).toHaveBeenCalledTimes(1);
});

it('disabled를 전달하면 input이 비활성화된다', () => {
  // 실제 토글 차단은 native input/브라우저 동작 — fireEvent는 jsdom에서 disabled
  // 가드를 거치지 않으므로, 컴포넌트가 책임지는 부분(disabled 속성 전달)만 검증한다.
  render(<Checkbox aria-label="동의" disabled />);
  expect(screen.getByRole('checkbox')).toBeDisabled();
});

it('children을 라벨로 렌더하고 라벨 클릭 시 토글된다', () => {
  render(<Checkbox>이용약관 동의</Checkbox>);
  const input = screen.getByRole('checkbox', { name: '이용약관 동의' });
  fireEvent.click(screen.getByText('이용약관 동의'));
  expect(input).toBeChecked();
});

it('기본 variant는 primary 아이콘을 렌더한다 (흰색 체크 stroke)', () => {
  const { container } = render(<Checkbox aria-label="동의" />);
  expect(container.querySelector('path[stroke="var(--color-white)"]')).toBeInTheDocument();
});

it('variant="white"이면 white 아이콘을 렌더한다 (indigo-600 체크 stroke)', () => {
  const { container } = render(<Checkbox aria-label="동의" variant="white" />);
  expect(container.querySelector('path[stroke="var(--color-indigo-600)"]')).toBeInTheDocument();
});

it('ref를 내부 input에 전달한다 (react-hook-form 호환)', () => {
  const ref = createRef<HTMLInputElement>();
  render(<Checkbox aria-label="동의" ref={ref} />);
  expect(ref.current).toBe(screen.getByRole('checkbox'));
  expect(ref.current?.tagName).toBe('INPUT');
});

it('style prop은 숨긴 input이 아니라 label 래퍼에 적용된다', () => {
  render(<Checkbox aria-label="동의" style={{ marginTop: 10 }} />);
  const input = screen.getByRole('checkbox');
  expect(input.closest('label')).toHaveStyle({ marginTop: '10px' });
  expect(input).not.toHaveStyle({ marginTop: '10px' });
});

it('장식 아이콘에 aria-hidden을 부여한다', () => {
  const { container } = render(<Checkbox aria-label="동의" />);
  const svgs = container.querySelectorAll('svg');
  expect(svgs).toHaveLength(2);
  svgs.forEach((svg) => expect(svg).toHaveAttribute('aria-hidden', 'true'));
});

it('두 variant 모두 기본 slate 라벨 색을 사용한다 (색은 소비 측이 선택)', () => {
  const { rerender } = render(<Checkbox>primary 라벨</Checkbox>);
  expect(screen.getByText('primary 라벨').closest('label')?.className).toMatch(/text-slate-700/);
  rerender(<Checkbox variant="white">white 라벨</Checkbox>);
  expect(screen.getByText('white 라벨').closest('label')?.className).toMatch(/text-slate-700/);
});
