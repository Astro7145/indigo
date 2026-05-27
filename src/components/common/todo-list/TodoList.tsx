'use client';

import { createContext, use, type ChangeEvent, type MouseEvent, type ReactNode, type Ref } from 'react';

import IconButton from '@/src/components/common/buttons/IconButton';
import Checkbox from '@/src/components/common/checkbox/Checkbox';
import { IcKebab } from '@/src/components/common/icons/IcKebab';
import { IcLink } from '@/src/components/common/icons/IcLink';
import { IcNote } from '@/src/components/common/icons/IcNote';
import { IcPencil } from '@/src/components/common/icons/IcPencil';
import { IcStar } from '@/src/components/common/icons/IcStar';
import { cn } from '@/src/utils/cn';

// 'responsive' — 부모 `@container` 폭 기준으로 small↔large 전환(<1024 small, ≥1024 large).
//   목표 카드(GoalTodoBoard)처럼 한 컴포넌트가 데스크톱은 큰 행, 태블릿/모바일은 작은 행을
//   써야 할 때 사용. `@container` 조상이 없으면 small과 동일하게 동작.
export type TodoListSize = 'large' | 'small' | 'responsive';
export type TodoListVariant = 'default' | 'onDark';

const TITLE_SIZE: Record<TodoListSize, string> = {
  large: 'text-base leading-6',
  small: 'text-sm leading-5',
  responsive: 'text-sm leading-5 @min-[1024px]:text-base @min-[1024px]:leading-6',
};
const ROW_SIZE: Record<TodoListSize, string> = {
  large: 'gap-2 px-2 py-2.5',
  small: 'gap-1.5 px-1 py-1.5',
  responsive: 'gap-1.5 px-1 py-1.5 @min-[1024px]:gap-2 @min-[1024px]:px-2 @min-[1024px]:py-2.5',
};
const ACTIONS_GAP: Record<TodoListSize, string> = {
  large: 'gap-2',
  small: 'gap-1.5',
  responsive: 'gap-1.5 @min-[1024px]:gap-2',
};

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
    TITLE_SIZE[size],
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
          'group flex w-full items-center rounded',
          ROW_SIZE[size],
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
  return <div className={cn('flex shrink-0 items-center', ACTIONS_GAP[size], className)}>{children}</div>;
}

/**
 * 액션 공통. hoverOnly면 행 hover 시에만 표시(CSS group-hover).
 * onClick이 있으면 IconButton(`<button>`), 없으면 동작 없는 인디케이터이므로 포커스 잡히는
 * no-op 버튼 대신 비대화형 `<span role="img">`으로 렌더한다(a11y — 표시만 하고 클릭/포커스 없음).
 */
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
  // 액션 아이콘 공통 hover/click 피드백 — 배경색이 액션마다 달라(투명/indigo-alpha/흰색)
  // 색 대신 scale 트랜스폼으로 통일(hover 시 살짝 확대, 누를 때 축소).
  const classes = cn(
    'size-6 shrink-0 rounded-full transition-transform hover:scale-110 active:scale-90',
    hoverOnly && 'hidden group-hover:inline-flex',
    className,
  );

  if (!onClick) {
    return (
      <span role="img" aria-label={label} className={cn('inline-flex items-center justify-center rounded', classes)}>
        {children}
      </span>
    );
  }

  return (
    <IconButton
      aria-label={label}
      hover={false}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onClick();
      }}
      className={classes}
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
      <IcNote className="size-6" />
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
      <IcLink className="size-6" />
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

// 케밥 — 현재는 클릭 시 동작 없음(placeholder). 공통 Dropdown 컴포넌트 작업 시 트리거로 연결 예정.
function KebabAction({ onClick, hoverOnly, className, ...rest }: ActionProps) {
  useTodoListContext();
  return (
    <ActionButton
      label={rest['aria-label'] ?? '더보기 메뉴'}
      onClick={onClick}
      hoverOnly={hoverOnly}
      className={cn('bg-white', className)}
    >
      <IcKebab className="size-[14px] text-indigo-600" />
    </ActionButton>
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
