'use client';

import { createContext, useState, type ReactNode, type Ref } from 'react';
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

export default function Modal({ open, onClose, size = 'large', className, children, ref }: ModalProps) {
  const [titleId, setTitleId] = useState<string | undefined>(undefined);

  if (typeof window === 'undefined' || !open) return null;

  return createPortal(
    <ModalContext value={{ size, close: onClose, setTitleId }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div
          ref={ref}
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
