'use client';

import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';

import IconButton from '@/src/components/common/buttons/IconButton';
import Checkbox from '@/src/components/common/checkbox/Checkbox';
import { IcKebab } from '@/src/components/common/icons/IcKebab';
import { IcLink } from '@/src/components/common/icons/IcLink';
import { IcNote } from '@/src/components/common/icons/IcNote';
import { IcPencil } from '@/src/components/common/icons/IcPencil';
import { IcStar } from '@/src/components/common/icons/IcStar';
import { cn } from '@/src/utils/cn';

export type TodoListSize = 'large' | 'small';
export type TodoListVariant = 'default' | 'onDark';

interface TodoListContextValue {
  checked: boolean;
  size: TodoListSize;
  variant: TodoListVariant;
}

const TodoListContext = createContext<TodoListContextValue | null>(null);

function useTodoListContext(): TodoListContextValue {
  const ctx = use(TodoListContext);
  if (!ctx) throw new Error('TodoList.* 서브컴포넌트는 <TodoList> 안에서만 사용할 수 있습니다.');
  return ctx;
}

export interface TodoListProps {
  title: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: TodoListSize;
  variant?: TodoListVariant;
  /** 우측 액션 그룹 — `<TodoList.Actions>` */
  children?: ReactNode;
  /** React 19 ref-as-prop — 행 컨테이너에 부착 */
  ref?: Ref<HTMLDivElement>;
  className?: string;
}

/**
 * 도메인 무관 "체크박스 + 타이틀 + 우측 액션" 행 프리미티브 (compound component).
 *
 * Context를 Root가 제공하고 서브컴포넌트는 `use(TodoListContext)`로 `checked`/`size`/`variant`를
 * 직접 소비한다 — 액션 노출 prop·단일 콜백 폭발 제거. Figma `21209:59947`.
 *
 * Star는 항상, Note/Link는 데이터가 있을 때 상시 표시(인디케이터), Edit/Kebab은 `hoverOnly`로 hover 시에만 노출.
 *
 * @example
 * <TodoList title={todo.title} checked={todo.done} onCheckedChange={onToggle}>
 *   <TodoList.Actions>
 *     {todo.linkUrl && <TodoList.LinkAction onClick={openLink} />}
 *     <TodoList.EditAction onClick={openEdit} hoverOnly />
 *     <TodoList.StarAction onClick={toggleFavorite} />
 *   </TodoList.Actions>
 * </TodoList>
 */
function TodoList({
  title,
  checked = false,
  onCheckedChange,
  size = 'large',
  variant = 'default',
  children,
  ref,
  className,
}: TodoListProps) {
  const titleClass = cn(
    'min-w-0 flex-1 truncate',
    size === 'small' ? 'text-sm leading-5' : 'text-base leading-6',
    variant === 'onDark'
      ? 'font-semibold text-white'
      : cn(
          'font-medium group-hover:font-semibold group-hover:text-indigo-700',
          checked ? 'text-slate-500' : 'text-slate-800',
        ),
  );

  return (
    <TodoListContext.Provider value={{ checked, size, variant }}>
      <div
        ref={ref}
        className={cn(
          'group flex w-full items-center',
          size === 'small' ? 'gap-1.5 rounded px-1 py-1.5' : 'gap-2 rounded px-2 py-2.5',
          variant === 'default' && 'hover:bg-indigo-700/30',
          className,
        )}
      >
        <Checkbox
          aria-label={title}
          checked={checked}
          variant={variant === 'onDark' ? 'white' : 'primary'}
          className="shrink-0"
          {...(onCheckedChange
            ? { onChange: (e: ChangeEvent<HTMLInputElement>) => onCheckedChange(e.target.checked) }
            : { readOnly: true })}
        />
        <span className={titleClass}>{title}</span>
        {children}
      </div>
    </TodoListContext.Provider>
  );
}

function Actions({ children, className }: { children?: ReactNode; className?: string }) {
  const { size } = useTodoListContext();
  return (
    <div className={cn('flex shrink-0 items-center', size === 'small' ? 'gap-1.5' : 'gap-2', className)}>
      {children}
    </div>
  );
}

/** 액션 공통 — 모든 액션은 IconButton. hoverOnly면 행 hover 시에만 표시(CSS group-hover). */
function ActionButton({
  label,
  onClick,
  hoverOnly,
  className,
  children,
}: {
  label: string;
  onClick?: () => void;
  hoverOnly?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <IconButton
      aria-label={label}
      hover={false}
      onClick={
        onClick
          ? (e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
      className={cn('size-7 shrink-0 rounded-full', hoverOnly && 'hidden group-hover:inline-flex', className)}
    >
      {children}
    </IconButton>
  );
}

interface ActionProps {
  onClick?: () => void;
  /** 행 hover 시에만 표시 */
  hoverOnly?: boolean;
  /** 기본 aria-label 오버라이드 */
  'aria-label'?: string;
  className?: string;
}

function NoteAction({ onClick, hoverOnly, className, ...rest }: ActionProps) {
  useTodoListContext();
  return (
    <ActionButton
      label={rest['aria-label'] ?? '노트'}
      onClick={onClick}
      hoverOnly={hoverOnly}
      className={cn('bg-indigo-alpha-20', className)}
    >
      <IcNote className="size-7" />
    </ActionButton>
  );
}

function LinkAction({ onClick, hoverOnly, className, ...rest }: ActionProps) {
  useTodoListContext();
  return (
    <ActionButton
      label={rest['aria-label'] ?? '링크'}
      onClick={onClick}
      hoverOnly={hoverOnly}
      className={cn('bg-indigo-alpha-20', className)}
    >
      <IcLink className="size-7" />
    </ActionButton>
  );
}

function EditAction({ onClick, hoverOnly, className, ...rest }: ActionProps) {
  useTodoListContext();
  return (
    <ActionButton
      label={rest['aria-label'] ?? '수정'}
      onClick={onClick}
      hoverOnly={hoverOnly}
      className={cn('bg-white', className)}
    >
      <IcPencil className="size-[14px] text-indigo-600" />
    </ActionButton>
  );
}

interface KebabActionProps {
  /** 메뉴 "수정하기" 선택 시 */
  onEdit?: () => void;
  /** 메뉴 "삭제하기" 선택 시 */
  onDelete?: () => void;
  /** 행 hover 시에만 표시 (메뉴가 열려 있으면 계속 표시) */
  hoverOnly?: boolean;
  className?: string;
}

// 케밥은 외부 onClick을 받지 않고 자체적으로 수정/삭제 드롭다운을 토글한다(외부 클릭·Esc로 닫힘).
// 수정/삭제의 실제 동작(API)은 onEdit/onDelete로 호출 측이 연결 — TodoList는 도메인 무관 유지.
function KebabAction({ onEdit, onDelete, hoverOnly, className }: KebabActionProps) {
  useTodoListContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: globalThis.MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const select = (handler?: () => void) => {
    setOpen(false);
    handler?.();
  };

  return (
    <div ref={ref} className={cn('relative shrink-0', hoverOnly && !open && 'hidden group-hover:block', className)}>
      <ActionButton label="더보기 메뉴" onClick={() => setOpen((o) => !o)} className="bg-white">
        <IcKebab className="size-[14px] text-indigo-600" />
      </ActionButton>
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 flex w-[102px] flex-col overflow-hidden rounded bg-white p-[5px] shadow-[0_4px_8px_0_rgba(0,0,0,0.1)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              select(onEdit);
            }}
            className="rounded-lg px-1.5 py-[3px] text-left text-sm leading-5 font-medium text-slate-700 hover:bg-slate-50"
          >
            수정하기
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation();
              select(onDelete);
            }}
            className="text-destructive rounded-lg px-1.5 py-[3px] text-left text-sm leading-5 font-medium hover:bg-slate-50"
          >
            삭제하기
          </button>
        </div>
      )}
    </div>
  );
}

interface StarActionProps {
  onClick?: () => void;
  /** 채운 별 여부 — 즐겨찾기 등 외부 상태로 제어. 행 checked(done)와 무관. 기본 false */
  active?: boolean;
  'aria-label'?: string;
  className?: string;
}

// active(채운 별)는 외부 상태(즐겨찾기)로 제어 — 낙관적 업데이트 시 호출 측이 동기화. checked(done)와 독립.
function StarAction({ onClick, active = false, className, ...rest }: StarActionProps) {
  useTodoListContext(); // <TodoList> 밖 사용 방지
  const label = rest['aria-label'] ?? (active ? '즐겨찾기 해제' : '즐겨찾기');
  return (
    <ActionButton label={label} onClick={onClick} className={className}>
      <IcStar state={active ? 'active' : 'default'} />
    </ActionButton>
  );
}

TodoList.Actions = Actions;
TodoList.NoteAction = NoteAction;
TodoList.LinkAction = LinkAction;
TodoList.EditAction = EditAction;
TodoList.KebabAction = KebabAction;
TodoList.StarAction = StarAction;

export default TodoList;
