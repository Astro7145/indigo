import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import Card from '@/src/components/common/cards/Card';

it('children과 기본 패딩(p-4) 클래스를 렌더한다', () => {
  render(<Card data-testid="card">hello</Card>);
  const el = screen.getByTestId('card');
  expect(el).toHaveTextContent('hello');
  expect(el).toHaveClass('p-4');
  expect(el).toHaveClass('bg-white');
  expect(el).toHaveClass('rounded');
  expect(el).toHaveClass('shadow-md');
});

it('className을 cn으로 병합한다 (패딩 override 허용)', () => {
  render(
    <Card className="w-[384px] p-12" data-testid="card">
      x
    </Card>,
  );
  const el = screen.getByTestId('card');
  expect(el).toHaveClass('p-12');
  expect(el).not.toHaveClass('p-4');
  expect(el).toHaveClass('w-[384px]');
});

it('div에 ref를 부착한다', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Card ref={ref} data-testid="card">
      x
    </Card>,
  );
  expect(ref.current).toBe(screen.getByTestId('card'));
});

it('onClick 제공 시 role="button" + tabIndex=0을 부여한다', () => {
  render(
    <Card onClick={jest.fn()} data-testid="card">
      x
    </Card>,
  );
  const el = screen.getByTestId('card');
  expect(el).toHaveAttribute('role', 'button');
  expect(el).toHaveAttribute('tabindex', '0');
});

it('onClick 미제공 시 role/tabIndex를 부여하지 않는다', () => {
  render(<Card data-testid="card">x</Card>);
  const el = screen.getByTestId('card');
  expect(el).not.toHaveAttribute('role');
  expect(el).not.toHaveAttribute('tabindex');
});

it('명시적 role/tabIndex가 내장 기본값보다 우선한다', () => {
  render(
    <Card onClick={jest.fn()} role="link" tabIndex={-1} data-testid="card">
      x
    </Card>,
  );
  const el = screen.getByTestId('card');
  expect(el).toHaveAttribute('role', 'link');
  expect(el).toHaveAttribute('tabindex', '-1');
});

it('클릭과 Enter/Space로 onClick을 호출한다', () => {
  const onClick = jest.fn();
  render(
    <Card onClick={onClick} data-testid="card">
      x
    </Card>,
  );
  const el = screen.getByTestId('card');
  fireEvent.click(el);
  fireEvent.keyDown(el, { key: 'Enter' });
  fireEvent.keyDown(el, { key: ' ' });
  expect(onClick).toHaveBeenCalledTimes(3);
});

it('다른 키로는 onClick을 호출하지 않는다', () => {
  const onClick = jest.fn();
  render(
    <Card onClick={onClick} data-testid="card">
      x
    </Card>,
  );
  fireEvent.keyDown(screen.getByTestId('card'), { key: 'Tab' });
  expect(onClick).not.toHaveBeenCalled();
});
