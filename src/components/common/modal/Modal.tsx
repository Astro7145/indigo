'use client';

import {
  createContext,
  use,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

import Button, { type ButtonProps } from '@/src/components/common/buttons/Button';
import IconButton from '@/src/components/common/buttons/IconButton';
import { IcDelete } from '@/src/components/common/icons';
import { cn } from '@/src/utils/cn';
import { lockScroll, unlockScroll } from '@/src/utils/scrollLock';

interface ModalContextValue {
  close: () => void;
  setTitleId: (id: string | undefined) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

interface ModalProps {
  open: boolean;
  onClose: () => void;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  className?: string;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
  // 아래 3개는 ModalStack이 스택 구동 시 전역 책임을 위임받기 위한 선택적 prop.
  // 기본값은 단독 사용 시의 현행 동작과 동일하므로 기존 직접 호출부는 영향받지 않는다.
  active?: boolean; // 최상단(topmost)일 때만 focus trap을 건다
  zIndex?: number; // 적층 시 z-index를 덮어쓴다 (미지정 시 z-50 클래스 유지)
  scrollLock?: boolean; // 스택이 scroll lock을 중앙 관리할 땐 false로 끈다
}

export default function Modal({
  open,
  onClose,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  showCloseButton = false,
  className,
  children,
  ref,
  active = true,
  zIndex,
  scrollLock = true,
}: ModalProps) {
  const [titleId, setTitleId] = useState<string | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const tClose = useTranslations('common')('actions.close');

  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closeOnEsc, onClose]);

  useEffect(() => {
    if (!open || !scrollLock) return;
    lockScroll();
    return () => unlockScroll();
  }, [open, scrollLock]);

  // 열림 시 트리거를 기억했다가 "닫힐 때만" 복귀시킨다. active 변화(위에 모달이 더 열려
  // 비활성화되는 경우)에는 복귀하지 않아야, 배경 페이지로 포커스가 새는 것을 막는다.
  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    return () => trigger?.focus();
  }, [open]);

  // focus trap은 최상단(active)일 때만: 첫 포커서블로 진입시키고 Tab을 내부에 가둔다.
  useEffect(() => {
    if (!open || !active) return;
    const container = containerRef.current;
    const getFocusable = () =>
      container
        ? Array.from(
            container.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];
    const focusables = getFocusable();
    (focusables[0] ?? container)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = getFocusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    container?.addEventListener('keydown', onKeyDown);
    return () => container?.removeEventListener('keydown', onKeyDown);
  }, [open, active]);

  if (typeof window === 'undefined' || !open) return null;

  const setRef = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
  };

  return createPortal(
    <ModalContext value={{ close: onClose, setTitleId }}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        style={zIndex !== undefined ? { zIndex } : undefined}
        onClick={(e) => {
          if (closeOnBackdropClick && e.target === e.currentTarget) onClose();
        }}
        data-testid="modal-backdrop"
      >
        <div
          ref={setRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={cn(
            'relative flex max-h-[90dvh] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded bg-white shadow-xl',
            // 크기는 반응형: 모바일=small(343px) / 데스크탑(sm:≥640px)=large(456px)
            'w-[343px] sm:w-[456px]',
            // padding: 센터 메시지(확인 popup) 비대칭 / 헤더형(제목+X) 대칭, 둘 다 모바일→데스크탑 반응형
            showCloseButton ? 'p-4 sm:p-8' : 'px-4 pt-12 pb-4 sm:px-8 sm:pt-16 sm:pb-8',
            className,
          )}
        >
          {children}
          {/* 닫기 버튼은 DOM 마지막에 두어 열림 시 포커스가 콘텐츠로 먼저 가도록 한다(시각 위치는 absolute로 우상단 고정) */}
          {showCloseButton && (
            <IconButton aria-label={tClose} onClick={onClose} className="absolute top-4 right-4 sm:top-8 sm:right-8">
              <IcDelete aria-hidden="true" className="size-6 text-slate-400" />
            </IconButton>
          )}
        </div>
      </div>
    </ModalContext>,
    document.body,
  );
}

function useModalContext() {
  const ctx = use(ModalContext);
  if (!ctx) {
    throw new Error('Modal 서브컴포넌트는 <Modal> 내부에서만 사용할 수 있습니다.');
  }
  return ctx;
}

interface ModalActionsProps {
  children: ReactNode;
  className?: string;
}

function ModalActions({ children, className }: ModalActionsProps) {
  // gap도 반응형: 모바일 gap-2 / 데스크탑 gap-3
  return <div className={cn('flex w-full items-center gap-2 sm:gap-3 [&>*]:flex-1', className)}>{children}</div>;
}

type ModalCancelProps = Omit<ButtonProps, 'variant' | 'size'>;

// Button의 size는 prop(고정)이라 반응형이 안 되므로, 모바일=small + sm:로 데스크탑 large(py/text)를 보강한다.
// (Button large 값과 동기화 필요 — 추후 Button(#15)이 반응형 size를 지원하면 그쪽으로 이전)
const responsiveButtonClass = 'sm:py-[13px] sm:text-lg';

function ModalCancel({ onClick, className, ...props }: ModalCancelProps) {
  const { close } = useModalContext();
  return (
    <Button
      variant="tertiary"
      size="small"
      onClick={onClick ?? close}
      className={cn(responsiveButtonClass, className)}
      {...props}
    />
  );
}

type ModalConfirmProps = Omit<ButtonProps, 'variant' | 'size' | 'onClick'> & {
  onClick: MouseEventHandler<HTMLButtonElement>;
};

function ModalConfirm({ className, ...props }: ModalConfirmProps) {
  return <Button variant="primary" size="small" className={cn(responsiveButtonClass, className)} {...props} />;
}

interface ModalTitleProps {
  children: ReactNode;
  className?: string;
}

function ModalTitle({ children, className }: ModalTitleProps) {
  const { setTitleId } = useModalContext();
  const id = useId();
  useEffect(() => {
    setTitleId(id);
    return () => setTitleId(undefined);
  }, [id, setTitleId]);
  // 타이포도 반응형: 모바일 text-sm / 데스크탑 text-xl
  return (
    <h2 id={id} className={cn('text-sm font-semibold text-slate-800 sm:text-xl', className)}>
      {children}
    </h2>
  );
}

Modal.Actions = ModalActions;
Modal.Cancel = ModalCancel;
Modal.Confirm = ModalConfirm;
Modal.Title = ModalTitle;
