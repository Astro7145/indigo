'use client';

import { createContext, useEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import { createPortal } from 'react-dom';

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
            'flex max-w-[calc(100vw-2rem)] flex-col rounded bg-white shadow-xl',
            sizeContainerClasses[size],
            className,
          )}
        >
          {children}
        </div>
      </div>
    </ModalContext>,
    document.body,
  );
}
