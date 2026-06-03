'use client';

import {
  createContext,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/src/utils/cn';

// SSR에서 useLayoutEffect 경고를 피하기 위한 동형(isomorphic) 레이아웃 이펙트
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// ── DropdownContext ───────────────────────────────────────────────────────────

interface DropdownContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  triggerRef: RefObject<HTMLElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const ctx = use(DropdownContext);
  if (!ctx) throw new Error('Dropdown 서브컴포넌트는 <Dropdown> 안에서만 사용할 수 있습니다.');
  return ctx;
}

// ── MenuContext (size를 Item에 전달) ──────────────────────────────────────────

interface MenuContextValue {
  size: MenuSize;
  close: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext() {
  const ctx = use(MenuContext);
  if (!ctx) throw new Error('Dropdown.Item은 <Dropdown.Menu> 안에서만 사용할 수 있습니다.');
  return ctx;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type Placement = 'bottom-start' | 'bottom-end' | 'bottom-center';
export type MenuSize = 'small' | 'large' | 'full';

interface DropdownProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: ReactNode;
}

interface TriggerProps {
  asChild?: boolean;
  className?: string;
  children: ReactNode;
}

interface MenuProps {
  placement?: Placement;
  size?: MenuSize;
  className?: string;
  children: ReactNode;
}

interface ItemProps {
  onClick?: () => void;
  disabled?: boolean;
  /** 현재 선택된 값 — 메뉴가 열릴 때 이 아이템으로 초기 포커스가 간다 */
  selected?: boolean;
  className?: string;
  children: ReactNode;
}

// ── components ───────────────────────────────────────────

function Dropdown({ open: controlledOpen, onOpenChange, className, children }: DropdownProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const triggerRef = useRef<HTMLElement>(null);

  const setOpen = (val: boolean) => {
    if (!isControlled) setUncontrolledOpen(val);
    onOpenChange?.(val);
  };

  return (
    <DropdownContext
      value={{
        isOpen,
        open: () => setOpen(true),
        close: () => setOpen(false),
        toggle: () => setOpen(!isOpen),
        triggerRef,
      }}
    >
      <div className={cn('relative', className)}>{children}</div>
    </DropdownContext>
  );
}

function Trigger({ asChild, className, children }: TriggerProps) {
  const { toggle, isOpen, triggerRef } = useDropdownContext();

  const handleTriggerClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    toggle();
  };

  const injectedProps = {
    ref: triggerRef as React.Ref<HTMLButtonElement>,
    onClick: handleTriggerClick,
    'aria-haspopup': true as const,
    'aria-expanded': isOpen,
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      ref?: React.Ref<HTMLElement>;
      onClick?: React.MouseEventHandler<HTMLElement>;
      className?: string;
    }>;
    return React.cloneElement(child, {
      ...injectedProps,
      className: cn(className, child.props.className),
      ref: (node: HTMLElement | null) => {
        triggerRef.current = node;
        const childRef = child.props.ref;
        if (typeof childRef === 'function') {
          childRef(node);
        } else if (childRef && typeof childRef === 'object' && 'current' in childRef) {
          // eslint-disable-next-line react-hooks/immutability
          (childRef as React.RefObject<HTMLElement | null>).current = node;
        }
      },
      // asChild 자식이 이벤트를 전달하지 않고 onClick을 호출할 수 있어(e 없음) 옵셔널 처리.
      // 그 경우 전파 차단은 자식이 책임진다.
      onClick: (e?: React.MouseEvent<HTMLElement>) => {
        e?.stopPropagation();
        toggle();
        if (e) child.props.onClick?.(e);
      },
    });
  }

  return (
    <button type="button" {...injectedProps} className={className}>
      {children}
    </button>
  );
}

const SIZE_WIDTH: Record<Exclude<MenuSize, 'full'>, number> = {
  small: 102,
  large: 400,
};

export interface MenuPosition {
  top: number;
  left: number;
  width: number;
}

// 트리거 사각형 기준으로 포털 메뉴의 fixed 좌표를 계산한다.
// 폭은 size별 결정적(full=트리거 너비), top은 트리거 바로 아래 +4px(mt-1).
export function computeMenuPosition(rect: DOMRect, placement: Placement, size: MenuSize): MenuPosition {
  const width = size === 'full' ? rect.width : SIZE_WIDTH[size];
  const top = rect.bottom + 4;
  let left: number;
  switch (placement) {
    case 'bottom-end':
      left = rect.right - width;
      break;
    case 'bottom-center':
      left = rect.left + rect.width / 2 - width / 2;
      break;
    default:
      left = rect.left;
  }
  return { top, left, width };
}

function Menu({ placement = 'bottom-start', size = 'large', className, children }: MenuProps) {
  const { isOpen, close, triggerRef } = useDropdownContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  // 외부 클릭 시 닫힘 (트리거 클릭은 toggle이 처리하므로 제외)
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen, close, triggerRef]);

  // Escape 시 닫힘 + 트리거 포커스 복귀
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close, triggerRef]);

  // 트리거 기준으로 메뉴 좌표 계산 (열린 동안 스크롤·리사이즈에 추종)
  useIsomorphicLayoutEffect(() => {
    if (!isOpen) return;
    const update = () => {
      const trigger = triggerRef.current;
      if (trigger) setPosition(computeMenuPosition(trigger.getBoundingClientRect(), placement, size));
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, placement, size, triggerRef]);

  // 열릴 때 selected 아이템 우선, 없으면 첫 번째 활성 아이템 자동 포커스
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const target =
      menuRef.current.querySelector<HTMLElement>(
        '[role="menuitem"][data-selected="true"]:not([aria-disabled="true"])',
      ) ?? menuRef.current.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])');
    target?.focus();
  }, [isOpen]);

  const handleArrowKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [],
    );
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      items[Math.min(currentIndex + 1, items.length - 1)]?.focus();
    } else {
      items[Math.max(currentIndex - 1, 0)]?.focus();
    }
  };

  if (!isOpen) return null;

  const closeAndFocusTrigger = () => {
    close();
    triggerRef.current?.focus();
  };

  return createPortal(
    <MenuContext value={{ size, close: closeAndFocusTrigger }}>
      <div
        ref={menuRef}
        role="menu"
        onKeyDown={handleArrowKey}
        style={position ? { top: position.top, left: position.left, width: position.width } : undefined}
        className={cn('fixed z-50 rounded bg-white shadow-[0px_4px_8px_rgba(0,0,0,0.1)]', className)}
      >
        {children}
      </div>
    </MenuContext>,
    document.body,
  );
}

function Item({ onClick, disabled = false, selected = false, className, children }: ItemProps) {
  const { size, close } = useMenuContext();

  const outerPadding = size === 'small' ? 'p-[5px]' : 'p-[6px]';
  const innerPadding = size === 'small' ? 'px-1.5 py-0.5' : 'p-2';
  const innerRadius = size === 'small' ? 'rounded-lg' : 'rounded';
  const textSize = size === 'small' ? 'text-sm' : 'text-base';

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onClick?.();
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <div className={outerPadding}>
      <div
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        data-selected={selected || undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={(e) => {
          if (!disabled) e.currentTarget.focus({ preventScroll: true });
        }}
        className={cn(
          'cursor-pointer font-medium text-slate-700',
          textSize,
          innerPadding,
          innerRadius,
          !disabled && 'bg-white hover:bg-indigo-300 focus-visible:bg-indigo-300 focus-visible:outline-none',
          disabled && 'cursor-not-allowed bg-white opacity-40',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

Dropdown.Trigger = Trigger;
Dropdown.Menu = Menu;
Dropdown.Item = Item;

export default Dropdown;
