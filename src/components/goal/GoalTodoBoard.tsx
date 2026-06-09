'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';

import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import Card from '@/src/components/common/cards/Card';
import SearchInput from '@/src/components/common/inputs/SearchInput';
import Button from '@/src/components/common/buttons/Button';
import IconButton from '@/src/components/common/buttons/IconButton';
import TodoList from '@/src/components/common/todo-list/TodoList';
import TodoDeleteConfirm from '@/src/components/todo/TodoDeleteConfirm';
import { IcPlus } from '@/src/components/common/icons/IcPlus';
import { useTodoList, useUpdateTodo } from '@/src/hooks/todo';
import { useAddTodoFavorite, useRemoveTodoFavorite } from '@/src/hooks/favorite';
import type { GoalListItem } from '@/src/types/goal';
import type { Todo } from '@/src/types/todo';
import { cn } from '@/src/utils/cn';

export interface GoalTodoBoardProps {
  goal: GoalListItem;
  className?: string;
  onEditTodo: (todo: Todo) => void;
  onAddTodo: (goalId: number) => void;
  onSelectTodo: (todo: Todo) => void;
}

function percentOf(done: number, total: number): number {
  if (total <= 0) return 0;
  // 데이터 이상(done>total 등)에도 진행바 width가 100%를 넘지 않도록 clamp
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

function Row({
  todo,
  onToggle,
  onToggleFavorite,
  onEdit,
  onSelect,
}: {
  todo: Todo;
  onToggle: (id: number, done: boolean) => void;
  onToggleFavorite: (id: number, isFavorite: boolean) => void;
  onEdit: (todo: Todo) => void;
  onSelect: (todo: Todo) => void;
}) {
  // 타입상 noteIds는 number[] required지만, 백엔드 응답이 누락/null인 케이스를 방어한다.
  const hasNote = (todo.noteIds?.length ?? 0) > 0;
  // 삭제 확인 모달 열림 상태 — 행 로컬로 소유.
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <li>
      <TodoList
        size="responsive"
        title={todo.title}
        checked={todo.done}
        onCheckedChange={(done) => onToggle(todo.id, done)}
        onClick={() => onSelect(todo)}
      >
        <TodoList.Actions>
          {/* 시안 순서: 노트(인디케이터) · 링크 · 노트작성(연필, 케밥 왼쪽) · 케밥 · 별 */}
          {hasNote && <TodoList.NoteAction onClick={() => {}} />}
          {todo.linkUrl && <TodoList.LinkAction onClick={() => {}} />}
          {/* 노트 없으면 hover 시 노트 작성(연필) 노출 */}
          {!hasNote && <TodoList.EditAction onClick={() => {}} hoverOnly aria-label="노트 작성" />}
          <TodoList.KebabAction hoverOnly onEdit={() => onEdit(todo)} onDelete={() => setConfirmOpen(true)} />
          <TodoList.StarAction active={todo.isFavorite} onClick={() => onToggleFavorite(todo.id, todo.isFavorite)} />
        </TodoList.Actions>
      </TodoList>
      {/* 닫혀 있을 땐 마운트하지 않아 행마다 useDeleteTodo/useToast 인스턴스가 쌓이지 않게 한다. */}
      {confirmOpen && <TodoDeleteConfirm open todo={todo} onClose={() => setConfirmOpen(false)} />}
    </li>
  );
}

function Column({
  label,
  todos,
  onToggle,
  onToggleFavorite,
  onEdit,
  onSelect,
}: {
  label: 'To do' | 'Done';
  todos: Todo[];
  onToggle: (id: number, done: boolean) => void;
  onToggleFavorite: (id: number, isFavorite: boolean) => void;
  onEdit: (todo: Todo) => void;
  onSelect: (todo: Todo) => void;
}) {
  const isTodo = label === 'To do';
  return (
    <div
      role="group"
      aria-label={label}
      // 칼럼 내부 클릭/키 이벤트는 카드(목표 상세 이동)로 전파시키지 않는다 — 단,
      // 칼럼 사이 gap·빈 상태·로딩은 본문 wrapper에 그대로 두어 카드 클릭이 전파된다.
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className={cn(
        // viewport 기준: <sm stacked, sm 옆나란히 compact(p-4·gap-2·auto 높이), lg+ spacious(p-6·gap-4·고정 324)
        'flex min-w-0 cursor-auto flex-col gap-2 overflow-hidden rounded border border-slate-200 p-4 sm:flex-1 xl:h-[324px] xl:gap-4 xl:p-6',
        // figma: To Do = slate-50 배경(그림자 없음), Done = 흰 배경 + 옅은 그림자
        isTodo ? 'bg-slate-50' : 'bg-white shadow-[0_2px_8px_0_rgba(0,0,0,0.04)]',
      )}
    >
      <span
        className={cn(
          'px-1 text-sm font-semibold tracking-[-0.03em] xl:px-2 xl:text-base xl:font-bold',
          isTodo ? 'text-indigo-700' : 'text-slate-400',
        )}
      >
        {isTodo ? 'TO DO' : 'DONE'}
      </span>
      <ul className="scrollbar-slate flex flex-col gap-0.5 xl:flex-1 xl:gap-1 xl:overflow-y-auto">
        {todos.map((t) => (
          <Row
            key={t.id}
            todo={t}
            onToggle={onToggle}
            onToggleFavorite={onToggleFavorite}
            onEdit={onEdit}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  );
}

export default function GoalTodoBoard({ goal, className, onEditTodo, onAddTodo, onSelectTodo }: GoalTodoBoardProps) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [keyword, setKeyword] = useState('');

  const reduce = useReducedMotion();

  const percent = percentOf(goal.completedCount, goal.todoCount);

  return (
    <Card
      onClick={() => router.push(`/goals/${goal.id}`)}
      className={cn(
        'flex cursor-pointer flex-col gap-4 border border-slate-200 px-8 py-6 shadow-[0_2px_4px_0_rgba(0,0,0,0.04)] transition-shadow hover:shadow-lg',
        className,
      )}
    >
      {/*
        헤더 — viewport 반응형(figma 1920/744/375):
        - mobile(<sm): 세로 스택 [제목+(+아이콘) / 바+%]  + [검색(전체폭)]
        - tablet(sm~lg): 한 줄 [제목 / 바+%] + [검색 + 할 일 추가]
        - desktop(lg+): 한 줄 [제목 + 바 + %] inline + [검색 + 할 일 추가]
      */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* 모바일: [제목+진행바](왼쪽 flex-1) + [추가 아이콘버튼](오른쪽)을 한 줄로 채운다.
            sm+에선 contents로 래퍼를 풀어 제목+진행바 그룹과 검색 그룹이 outer의 flex-row 자식이 되고,
            아이콘버튼은 숨는다(검색 옆 텍스트 '할 일 추가' 버튼이 대신). */}
        <div className="flex items-center gap-4 sm:contents">
          <div className="flex min-w-0 flex-1 flex-col gap-1 xl:max-w-[550px] xl:flex-row xl:items-center xl:gap-4">
            {/* 제목 — 데스크톱은 진행바와 226:358 비율(grow 가중치)로 함께 축소. 600폭에서 226 */}
            <h3 className="min-w-0 truncate text-base font-semibold tracking-[-0.03em] text-slate-700 xl:flex-[200]">
              {goal.title}
            </h3>
            {/* 진행바 + % — 모바일 202px 고정(시안), tablet은 컬럼 채움. desktop은 제목과 비율 축소(grow 358 → 600폭에서 바 310) */}
            <div className="flex items-center gap-2 pr-4 xl:min-w-0 xl:flex-[350]">
              <div
                role="progressbar"
                aria-label={`${goal.title} 진행률`}
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 w-full shrink overflow-hidden rounded-full bg-[#e9e9e9] sm:w-full sm:max-w-[310px] xl:w-auto xl:flex-1"
              >
                <motion.div
                  className="h-full rounded-full bg-indigo-500"
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
                />
              </div>
              <span className="shrink-0 text-sm font-bold tracking-[-0.03em] text-indigo-600 xl:w-10 xl:text-right xl:text-base">
                {percent}%
              </span>
            </div>
          </div>
          {/* 할 일 추가 — 모바일 전용 아이콘 버튼 */}
          <IconButton
            aria-label="할 일 추가"
            className="size-9 shrink-0 rounded border border-indigo-500 sm:hidden"
            onClick={(e) => {
              e.stopPropagation();
              onAddTodo(goal.id);
            }}
          >
            <IcPlus className="size-4 text-indigo-600" />
          </IconButton>
        </div>
        {/* 검색 + 할 일 추가(텍스트) — 모바일은 block으로 검색이 줄 전체를 채우고, 텍스트 버튼은 sm+에서 노출. 둘 다 높이 40px */}
        <div
          className="w-full sm:flex sm:w-auto sm:shrink-0 sm:items-center sm:gap-2 xl:gap-3.5"
          onClick={(e) => e.stopPropagation()}
          // 검색창 Enter 등 키보드 이벤트가 카드(role=button)까지 버블링돼 목표 상세로 이동하는 것 차단
          onKeyDown={(e) => e.stopPropagation()}
        >
          <SearchInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSearch={() => setKeyword(input)}
            className="h-10 w-full sm:w-[240px]"
          />
          <Button
            variant="secondary"
            size="small"
            startIcon={<IcPlus className="size-5 text-indigo-600" />}
            className="hidden h-10 shrink-0 whitespace-nowrap sm:inline-flex"
            onClick={() => onAddTodo(goal.id)}
          >
            할 일 추가
          </Button>
        </div>
      </div>

      {/*
        본문 영역. 카드 활성화 차단은 각 Column에서 처리 — 칼럼 사이 gap·빈 상태·로딩은 카드 클릭이
        그대로 전파돼 목표 상세로 이동한다. 데스크톱(lg+)은 칼럼 높이(324)를 예약해 로딩/빈 상태에도
        카드 높이를 유지 — 무한스크롤 sentinel이 조기에 화면에 들어와 다음 페이지가 연쇄 로딩되는
        것을 막고 레이아웃 시프트도 방지한다.
      */}
      <div className="xl:flex xl:min-h-[324px] xl:flex-col xl:justify-center">
        <AsyncBoundary
          fallback={<p className="py-10 text-center text-sm text-slate-400">불러오는 중…</p>}
          errorFallback={<p className="py-10 text-center text-sm text-slate-400">불러오지 못했어요</p>}
        >
          <GoalTodoBoardBody goalId={goal.id} keyword={keyword} onEditTodo={onEditTodo} onSelectTodo={onSelectTodo} />
        </AsyncBoundary>
      </div>
    </Card>
  );
}

function GoalTodoBoardBody({
  goalId,
  keyword,
  onEditTodo,
  onSelectTodo,
}: {
  goalId: number;
  keyword: string;
  onEditTodo: (todo: Todo) => void;
  onSelectTodo: (todo: Todo) => void;
}) {
  const { data } = useTodoList({ goalId, keyword: keyword || undefined });
  const update = useUpdateTodo();
  const addFavorite = useAddTodoFavorite();
  const removeFavorite = useRemoveTodoFavorite();

  const todos = data.todos;
  const todoItems = todos.filter((t) => !t.done);
  const doneItems = todos.filter((t) => t.done);

  const toggle = (id: number, done: boolean) => update.mutate({ todoId: id, body: { done } });
  const toggleFavorite = (id: number, isFavorite: boolean) =>
    isFavorite ? removeFavorite.mutate(id) : addFavorite.mutate(id);

  if (todos.length === 0) {
    return keyword ? (
      <p className="py-10 text-center text-sm text-slate-500">검색 결과가 없어요</p>
    ) : (
      <p className="py-10 text-center text-sm text-slate-500">아직 할 일이 없어요</p>
    );
  }

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:gap-2 xl:gap-8">
      <Column
        label="To do"
        todos={todoItems}
        onToggle={toggle}
        onToggleFavorite={toggleFavorite}
        onEdit={onEditTodo}
        onSelect={onSelectTodo}
      />
      <Column
        label="Done"
        todos={doneItems}
        onToggle={toggle}
        onToggleFavorite={toggleFavorite}
        onEdit={onEditTodo}
        onSelect={onSelectTodo}
      />
    </div>
  );
}
