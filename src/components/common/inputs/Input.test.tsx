import { fireEvent, render, screen } from '@testing-library/react';

import Input from '@/src/components/common/inputs/Input';

it('input 요소를 렌더링한다', () => {
  render(<Input />);
  expect(screen.getByRole('textbox')).toBeInTheDocument();
});

it('placeholder가 표시된다', () => {
  render(<Input placeholder="입력해주세요" />);
  expect(screen.getByPlaceholderText('입력해주세요')).toBeInTheDocument();
});

it('iconRight prop으로 전달된 요소가 렌더링된다', () => {
  render(<Input iconRight={<button>아이콘</button>} />);
  expect(screen.getByRole('button', { name: '아이콘' })).toBeInTheDocument();
});

it('input이 포커스를 받을 수 있다', () => {
  // Input 컨테이너가 <label>로 변경되어 클릭 → 포커스 전달은 브라우저 네이티브 동작.
  // jsdom은 fireEvent.click/focus로 document.activeElement를 변경하지 않으므로
  // DOM API를 직접 호출해 focusable 여부를 검증한다.
  render(<Input />);
  const input = screen.getByRole('textbox');
  (input as HTMLElement).focus();
  expect(input).toHaveFocus();
});

it('onChange prop을 전달하면 입력 시 호출된다', () => {
  const onChange = jest.fn();
  render(<Input onChange={onChange} />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '테스트' } });
  expect(onChange).toHaveBeenCalledTimes(1);
});

it('disabled prop이 input에 적용된다', () => {
  render(<Input disabled />);
  expect(screen.getByRole('textbox')).toBeDisabled();
});

it('variant="error"이면 컨테이너에 error 클래스가 적용된다', () => {
  render(<Input variant="error" />);
  expect(screen.getByRole('textbox').parentElement).toHaveClass('border-destructive');
});

it('variant="default"이면 컨테이너에 기본 border 클래스가 적용된다', () => {
  render(<Input />);
  expect(screen.getByRole('textbox').parentElement).toHaveClass('border-slate-300');
});
