'use client';

import { useState } from 'react';
import { getLocalTimeZone, today, type CalendarDate } from '@internationalized/date';

import AsyncBoundary from '@/src/components/common/AsyncBoundary';
import Button from '@/src/components/common/buttons/Button';
import Card from '@/src/components/common/cards/Card';
import Dropdown from '@/src/components/common/dropdown/Dropdown';
import { IcChevron } from '@/src/components/common/icons/IcChevron';
import { IcGoal } from '@/src/components/common/icons/IcGoal';
import { IcPlus } from '@/src/components/common/icons/IcPlus';
import MonthCalendar from '@/src/components/todo/calendar/MonthCalendar';
import SelectedDateTodos from '@/src/components/todo/calendar/SelectedDateTodos';
import TodoDetailSheet from '@/src/components/todo/TodoDetailSheet';
import TodoFormSheet from '@/src/components/todo/TodoFormSheet';
import { useGoalList } from '@/src/hooks/goal';
import { useAllTodos } from '@/src/hooks/todo';
import { useMe } from '@/src/hooks/user';
import type { Todo } from '@/src/types/todo';
import { calendarDateToIso, isoToCalendarDate } from '@/src/utils/date';

const statusMessageClass = 'py-16 text-center text-sm text-slate-400';

export interface CalendarViewProps {
  /** 목표 상세 "캘린더 보기" 진입(`/calendar?goalId=X`) 프리셋 — 파싱·검증과 변경 시 리마운트(key)는 page 담당 */
  initialGoalId?: number;
}

/**
 * /calendar 본문 — 월 그리드에 dueDate 기준으로 할일 표시. 이슈 #150.
 * 선택 날짜·목표 필터·시트 상태를 소유하고, 데이터 본문(월 네비+그리드+선택 리스트)을 AsyncBoundary로 감싼다
 * (월 네비는 react-aria 상태와 결합돼 있어 chrome으로 분리하지 않음 — GoalTodoBoard의 전체 경계와 동일 판단).
 * 모바일 페이지 타이틀은 GNB(usePageTitle)가 담당 → 헤더는 sm+ 노출, 모바일은 하단 풀폭 추가 버튼.
 */
export default function CalendarView({ initialGoalId }: CalendarViewProps) {
  const [goalId, setGoalId] = useState<number | null>(initialGoalId ?? null);
  const [selectedDate, setSelectedDate] = useState<CalendarDate>(() => today(getLocalTimeZone()));
  const [creating, setCreating] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const { data: me } = useMe();

  return (
    <section className="mx-auto flex w-full max-w-320 flex-col gap-6">
      {/* 모바일은 GNB가 페이지 타이틀을 담당 → sm+에서만 헤더 노출 (/todos와 동일 패턴) */}
      <div className="hidden items-center justify-between px-2 sm:flex">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-800">
          {me ? `${me.name}님의 캘린더` : '캘린더'}
        </h1>
        <Button
          variant="primary"
          size="small"
          startIcon={<IcPlus className="size-5 text-white" />}
          className="whitespace-nowrap"
          onClick={() => setCreating(true)}
        >
          할 일 추가
        </Button>
      </div>

      {/* 모바일은 풀블리드(시안), sm+는 카드 */}
      <Card className="-mx-4 overflow-hidden rounded-none border-y border-slate-200 p-0 shadow-[0_0_60px_0_rgba(0,0,0,0.05)] sm:mx-0 sm:rounded-[4px] sm:border">
        <AsyncBoundary
          fallback={<p className={statusMessageClass}>불러오는 중…</p>}
          errorFallback={<p className={statusMessageClass}>불러오지 못했어요</p>}
          resetKeys={[goalId]}
        >
          <CalendarContent
            goalId={goalId}
            onChangeGoalId={setGoalId}
            selectedDate={selectedDate}
            onChangeSelectedDate={setSelectedDate}
            onSelectTodo={setSelectedTodo}
          />
        </AsyncBoundary>
      </Card>

      {/* 모바일 하단 풀폭 추가 버튼 (시안) */}
      <Button
        variant="primary"
        size="large"
        startIcon={<IcPlus className="size-5 text-white" />}
        className="w-full sm:hidden"
        onClick={() => setCreating(true)}
      >
        할 일 추가
      </Button>

      <TodoFormSheet
        mode="create"
        isOpen={creating}
        onClose={() => setCreating(false)}
        defaultGoalId={goalId ?? undefined}
        defaultDueDate={calendarDateToIso(selectedDate) ?? undefined}
      />
      <TodoDetailSheet isOpen={selectedTodo !== null} onClose={() => setSelectedTodo(null)} todo={selectedTodo} />
    </section>
  );
}

function CalendarContent({
  goalId,
  onChangeGoalId,
  selectedDate,
  onChangeSelectedDate,
  onSelectTodo,
}: {
  goalId: number | null;
  onChangeGoalId: (goalId: number | null) => void;
  selectedDate: CalendarDate;
  onChangeSelectedDate: (date: CalendarDate) => void;
  onSelectTodo: (todo: Todo) => void;
}) {
  const { data } = useAllTodos();
  // 필터 드롭다운 — favorites 페이지와 동일 패턴 (공용 추출은 #150 범위 제외)
  const { data: goalData } = useGoalList({ limit: 100 });
  const goals = goalData?.goals ?? [];
  const selectedGoal = goals.find((g) => g.id === goalId) ?? null;

  // dueDate 없는 할일 제외 + 목표 필터. 월 필터는 불필요 — 셀이 자기 날짜만 조회한다.
  const todosByDate = new Map<string, Todo[]>();
  for (const t of data.todos) {
    if (goalId !== null && t.goalId !== goalId) continue;
    // null뿐 아니라 빈 문자열 등 falsy dueDate도 함께 거른다 (백엔드 응답 느슨함 방어)
    const date = isoToCalendarDate(t.dueDate);
    if (!date) continue;
    const key = date.toString();
    const list = todosByDate.get(key);
    if (list) list.push(t);
    else todosByDate.set(key, [t]);
  }

  return (
    <>
      <MonthCalendar
        value={selectedDate}
        onChange={onChangeSelectedDate}
        todosByDate={todosByDate}
        onSelectTodo={onSelectTodo}
      >
        <Dropdown className="w-full xl:w-[350px]">
          <Dropdown.Trigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-sm border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <span className="flex items-center gap-2">
                <IcGoal className="size-8" />
                <span className="text-sm font-semibold tracking-[-0.03em] text-slate-700">
                  {selectedGoal ? selectedGoal.title : '전체 목표'}
                </span>
              </span>
              <IcChevron direction="down" />
            </button>
          </Dropdown.Trigger>
          <Dropdown.Menu size="full">
            <Dropdown.Item onClick={() => onChangeGoalId(null)}>전체 목표</Dropdown.Item>
            {goals.map((g) => (
              <Dropdown.Item key={g.id} onClick={() => onChangeGoalId(g.id)}>
                {g.title}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </MonthCalendar>
      <div className="xl:hidden">
        <SelectedDateTodos
          date={selectedDate}
          todos={todosByDate.get(selectedDate.toString()) ?? []}
          onSelectTodo={onSelectTodo}
        />
      </div>
    </>
  );
}
