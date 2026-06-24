import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useModalStore } from '@/src/stores/modal';
import { _resetScrollLock } from '@/src/utils/scrollLock';

// auto variant 해석을 데스크탑(=Modal)으로 고정
jest.mock('@/src/hooks/useIsMobile', () => ({ useIsMobile: () => false }));

// BottomSheet 내부 motion/react-aria를 jsdom에서 단순화
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, onClick, onKeyDown, className, style }: React.HTMLAttributes<HTMLDivElement>) => (
      <div onClick={onClick} onKeyDown={onKeyDown} className={className} style={style}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  useDragControls: () => ({ start: jest.fn() }),
  usePresence: () => [true, () => {}],
}));
jest.mock('react-aria', () => ({ usePreventScroll: jest.fn() }));

import ModalStack from './ModalStack';

beforeEach(() => {
  useModalStore.setState({ modals: [] });
  _resetScrollLock();
  document.body.style.overflow = '';
});

it('스택이 비어 있으면 아무 모달도 보이지 않는다', () => {
  render(<ModalStack />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('open한 엔트리의 내용을 화면에 렌더한다', () => {
  render(<ModalStack />);
  act(() => {
    useModalStore.getState().open(() => <p>모달 내용</p>, { variant: 'modal' });
  });
  expect(screen.getByText('모달 내용')).toBeInTheDocument();
});

it('options.className을 Modal 셸(dialog)에 전달한다', () => {
  render(<ModalStack />);
  act(() => {
    useModalStore.getState().open(() => <p>너비 조정 모달</p>, { variant: 'modal', className: 'w-[400px]' });
  });
  expect(screen.getByRole('dialog')).toHaveClass('w-[400px]');
});

it('두 모달을 열면 둘 다 동시에 보인다', () => {
  render(<ModalStack />);
  act(() => {
    useModalStore.getState().open(() => <p>첫 번째</p>, { variant: 'modal' });
    useModalStore.getState().open(() => <p>두 번째</p>, { variant: 'modal' });
  });
  expect(screen.getByText('첫 번째')).toBeInTheDocument();
  expect(screen.getByText('두 번째')).toBeInTheDocument();
});

it('render에 주입된 close를 호출하면 해당 모달이 닫힌다', () => {
  render(<ModalStack />);
  act(() => {
    useModalStore.getState().open(({ close }) => <button onClick={close}>내부 닫기</button>, { variant: 'modal' });
  });
  act(() => {
    fireEvent.click(screen.getByText('내부 닫기'));
  });
  expect(screen.queryByText('내부 닫기')).not.toBeInTheDocument();
});

it('ESC를 누르면 최상단 모달 하나만 닫힌다 (LIFO)', () => {
  render(<ModalStack />);
  act(() => {
    useModalStore.getState().open(() => <p>아래 모달</p>, { variant: 'modal' });
    useModalStore.getState().open(() => <p>위 모달</p>, { variant: 'modal' });
  });
  act(() => {
    fireEvent.keyDown(document, { key: 'Escape' });
  });
  expect(screen.queryByText('위 모달')).not.toBeInTheDocument();
  expect(screen.getByText('아래 모달')).toBeInTheDocument();
});

it('최상단 엔트리에 onClose가 지정되면 ESC가 close 대신 onClose를 호출한다', () => {
  const onClose = jest.fn();
  render(<ModalStack />);
  act(() => {
    useModalStore.getState().open(() => <p>폼 모달</p>, { variant: 'modal', onClose });
  });
  act(() => {
    fireEvent.keyDown(document, { key: 'Escape' });
  });
  // onClose는 닫는 방식만 위임받는다(여기선 닫지 않음) → 엔트리는 그대로 남고 close는 호출되지 않는다.
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(screen.getByText('폼 모달')).toBeInTheDocument();
});

it('스택에 모달이 있으면 body 스크롤을 잠그고 모두 닫히면 해제한다', () => {
  render(<ModalStack />);
  act(() => {
    useModalStore.getState().open(() => <p>내용</p>, { variant: 'modal' });
  });
  expect(document.body.style.overflow).toBe('hidden');
  act(() => {
    useModalStore.getState().close();
  });
  expect(document.body.style.overflow).toBe('');
});

it('아래 모달보다 위 모달에 더 높은 z-index를 부여한다', () => {
  render(<ModalStack />);
  act(() => {
    useModalStore.getState().open(() => <p>아래</p>, { variant: 'modal' });
    useModalStore.getState().open(() => <p>위</p>, { variant: 'modal' });
  });
  const backdrops = screen.getAllByTestId('modal-backdrop');
  expect(backdrops[0]).toHaveStyle({ zIndex: 100 });
  expect(backdrops[1]).toHaveStyle({ zIndex: 101 });
});

it('bottom-sheet는 백드롭 클릭에 반응해 닫힌다 (onClose 미지정 시 close)', () => {
  render(<ModalStack />);
  act(() => {
    useModalStore.getState().open(() => <p>시트 내용</p>, { variant: 'bottom-sheet' });
  });
  act(() => {
    fireEvent.click(document.querySelector('.fixed.inset-0') as HTMLElement);
  });
  expect(screen.queryByText('시트 내용')).not.toBeInTheDocument();
});

it('bottom-sheet 엔트리에 onClose가 지정되면 백드롭 클릭이 close 대신 onClose를 호출한다', () => {
  const onClose = jest.fn();
  render(<ModalStack />);
  act(() => {
    useModalStore.getState().open(() => <p>폼 시트</p>, { variant: 'bottom-sheet', onClose });
  });
  act(() => {
    fireEvent.click(document.querySelector('.fixed.inset-0') as HTMLElement);
  });
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(screen.getByText('폼 시트')).toBeInTheDocument();
});

it("variant가 'bottom-sheet'이면 BottomSheet로 렌더한다", () => {
  render(<ModalStack />);
  act(() => {
    useModalStore.getState().open(() => <p>시트 내용</p>, { variant: 'bottom-sheet' });
  });
  expect(screen.getByText('시트 내용')).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.querySelector('.fixed.bottom-0')).toBeInTheDocument();
});
