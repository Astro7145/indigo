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

import Button, { type ButtonProps } from '@/src/components/common/buttons/Button';
import { IcDelete } from '@/src/components/common/icons';
import { cn } from '@/src/utils/cn';

type ModalSize = 'large' | 'small';

interface ModalContextValue {
  size: ModalSize;
  close: () => void;
  setTitleId: (id: string | undefined) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

interface ModalProps {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  className?: string;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

const sizeContainerClasses: Record<ModalSize, string> = {
  large: 'w-[456px] px-8 pt-16 pb-8',
  small: 'w-[343px] px-4 pt-12 pb-4',
};

export default function Modal({
  open,
  onClose,
  size = 'large',
  closeOnBackdropClick = true,
  closeOnEsc = true,
  showCloseButton = false,
  className,
  children,
  ref,
}: ModalProps) {
  const [titleId, setTitleId] = useState<string | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closeOnEsc, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
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
    return () => {
      container?.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  if (typeof window === 'undefined' || !open) return null;

  const setRef = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
  };

  return createPortal(
    <ModalContext value={{ size, close: onClose, setTitleId }}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
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
            'relative flex max-w-[calc(100vw-2rem)] flex-col rounded bg-white shadow-xl',
            sizeContainerClasses[size],
            className,
          )}
        >
          {showCloseButton && (
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="group absolute top-6 right-6 cursor-pointer"
            >
              <IcDelete className="size-6 text-slate-400 transition-colors group-hover:text-slate-600" />
            </button>
          )}
          {children}
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
  const { size } = useModalContext();
  return (
    <div className={cn('flex w-full items-center [&>*]:flex-1', size === 'large' ? 'gap-3' : 'gap-2', className)}>
      {children}
    </div>
  );
}

type ModalCancelProps = Omit<ButtonProps, 'variant' | 'size'>;

function ModalCancel({ onClick, ...props }: ModalCancelProps) {
  const { size, close } = useModalContext();
  return <Button variant="tertiary" size={size} onClick={onClick ?? close} {...props} />;
}

type ModalConfirmProps = Omit<ButtonProps, 'variant' | 'size' | 'onClick'> & {
  onClick: MouseEventHandler<HTMLButtonElement>;
};

function ModalConfirm(props: ModalConfirmProps) {
  const { size } = useModalContext();
  return <Button variant="primary" size={size} {...props} />;
}

interface ModalTitleProps {
  children: ReactNode;
  className?: string;
}

function ModalTitle({ children, className }: ModalTitleProps) {
  const { size, setTitleId } = useModalContext();
  const id = useId();
  useEffect(() => {
    setTitleId(id);
    return () => setTitleId(undefined);
  }, [id, setTitleId]);
  return (
    <h2 id={id} className={cn('font-semibold text-slate-800', size === 'large' ? 'text-xl' : 'text-sm', className)}>
      {children}
    </h2>
  );
}

Modal.Actions = ModalActions;
Modal.Cancel = ModalCancel;
Modal.Confirm = ModalConfirm;
Modal.Title = ModalTitle;
