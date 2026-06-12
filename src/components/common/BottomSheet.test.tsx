import { fireEvent, render, screen } from '@testing-library/react';

const mockCallbacks: {
  onDragEnd?: (e: unknown, info: { offset: { y: number }; velocity: { y: number } }) => void;
} = {};

jest.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      onClick,
      onKeyDown,
      onDragEnd,
      className,
      style,
    }: React.HTMLAttributes<HTMLDivElement> & {
      onDragEnd?: (e: unknown, info: { offset: { y: number }; velocity: { y: number } }) => void;
    }) => {
      if (onDragEnd) {
        mockCallbacks.onDragEnd = onDragEnd;
      }
      return (
        <div onClick={onClick} onKeyDown={onKeyDown} className={className} style={style}>
          {children}
        </div>
      );
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useDragControls: () => ({ start: jest.fn() }),
  usePresence: () => [true, () => {}],
}));

jest.mock('react-aria', () => ({ usePreventScroll: jest.fn() }));

import { usePreventScroll } from 'react-aria';

import BottomSheet from './BottomSheet';

it('isOpen이 false이면 아무것도 렌더하지 않는다', () => {
  render(
    <BottomSheet isOpen={false} onClose={jest.fn()}>
      <p>내용</p>
    </BottomSheet>,
  );
  expect(screen.queryByText('내용')).not.toBeInTheDocument();
});

it('isOpen이 true이면 children을 렌더한다', () => {
  render(
    <BottomSheet isOpen onClose={jest.fn()}>
      <p>내용</p>
    </BottomSheet>,
  );
  expect(screen.getByText('내용')).toBeInTheDocument();
});

it('백드롭 클릭 시 onClose를 호출한다', () => {
  const onClose = jest.fn();
  render(
    <BottomSheet isOpen onClose={onClose}>
      <p>내용</p>
    </BottomSheet>,
  );
  const backdrop = document.querySelector('.fixed.inset-0') as HTMLElement;
  fireEvent.click(backdrop);
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('closeOnBackdropClick=false이면 백드롭 클릭을 무시한다', () => {
  const onClose = jest.fn();
  render(
    <BottomSheet isOpen closeOnBackdropClick={false} onClose={onClose}>
      <p>내용</p>
    </BottomSheet>,
  );
  const backdrop = document.querySelector('.fixed.inset-0') as HTMLElement;
  fireEvent.click(backdrop);
  expect(onClose).not.toHaveBeenCalled();
});

it('Escape 키를 누르면 onClose를 호출한다', () => {
  const onClose = jest.fn();
  render(
    <BottomSheet isOpen onClose={onClose}>
      <p>내용</p>
    </BottomSheet>,
  );
  const panel = document.querySelector('.fixed.bottom-0') as HTMLElement;
  fireEvent.keyDown(panel, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('패널을 아래로 충분히 드래그하면 onClose를 호출한다', () => {
  const onClose = jest.fn();
  render(
    <BottomSheet isOpen onClose={onClose}>
      <p>내용</p>
    </BottomSheet>,
  );
  if (mockCallbacks.onDragEnd) {
    mockCallbacks.onDragEnd(null, { offset: { y: 100 }, velocity: { y: 0 } });
  }
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('zIndex를 지정하면 백드롭과 패널에 적용한다', () => {
  render(
    <BottomSheet isOpen zIndex={62} onClose={jest.fn()}>
      <p>내용</p>
    </BottomSheet>,
  );
  expect(document.querySelector('.fixed.inset-0')).toHaveStyle({ zIndex: 62 });
  expect(document.querySelector('.fixed.bottom-0')).toHaveStyle({ zIndex: 62 });
});

it('scrollLock=false이면 usePreventScroll을 비활성화한다', () => {
  render(
    <BottomSheet isOpen scrollLock={false} onClose={jest.fn()}>
      <p>내용</p>
    </BottomSheet>,
  );
  expect(usePreventScroll).toHaveBeenCalledWith({ isDisabled: true });
});
