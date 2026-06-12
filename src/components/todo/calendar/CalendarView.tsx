'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'react-aria';
import {
  endOfMonth,
  endOfWeek,
  getLocalTimeZone,
  startOfMonth,
  startOfWeek,
  today,
  type CalendarDate,
} from '@internationalized/date';

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
import { usePrefetchTodosInRange, useTodosInRange } from '@/src/hooks/todo';
import { useMe } from '@/src/hooks/user';
import type { Todo } from '@/src/types/todo';
import { calendarDateToIso, isoToCalendarDate } from '@/src/utils/date';

const statusMessageClass = 'py-16 text-center text-sm text-slate-400';

/** `?goalId=` 파싱 — 잘못된 값(비정수·0 이하)은 전체 목표 */
function parseGoalId(raw: string | null): number | null {
  const n = Number(raw);
  return raw !== null && Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * /calendar 본문 — 월 그리드에 dueDate 기준으로 할일 표시. 이슈 #150.
 * 선택 날짜·목표 필터·시트 상태를 소유하고, 데이터 본문(월 네비+그리드+선택 리스트)을 AsyncBoundary로 감싼다
 * (월 네비는 react-aria 상태와 결합돼 있어 chrome으로 분리하지 않음 — GoalTodoBoard의 전체 경계와 동일 판단).
 * 모바일 페이지 타이틀은 GNB(usePageTitle)가 담당 → 헤더는 sm+ 노출, 모바일은 하단 풀폭 추가 버튼.
 */
export default function CalendarView() {
  // 목표 필터의 단일 소스는 URL — prop으로 받으면 뒤로가기 시 라우터 캐시의 옛 RSC 페이로드(옛 prop)와
  // 현재 URL이 어긋나 필터가 적용되지 않는다. 동적 라우트라 useSearchParams는 SSR에서도 실제 값을 준다.
  const urlGoalId = parseGoalId(useSearchParams().get('goalId'));
  const [goalId, setGoalId] = useState<number | null>(urlGoalId);
  const [syncedGoalId, setSyncedGoalId] = useState<number | null>(urlGoalId);
  // 뒤로가기/앞으로가기로 URL이 바뀌면 필터를 URL에 맞춘다 (렌더 중 보정 — derived state 패턴)
  if (urlGoalId !== syncedGoalId) {
    setSyncedGoalId(urlGoalId);
    setGoalId(urlGoalId);
  }
  // 필터 변경을 URL에도 반영(셸로우) — 서버 왕복·리마운트 없이 새로고침/공유 시 현재 필터가 보존된다.
  const changeGoalId = (id: number | null) => {
    setGoalId(id);
    window.history.replaceState(null, '', id === null ? '/calendar' : `/calendar?goalId=${id}`);
  };
  const [selectedDate, setSelectedDate] = useState<CalendarDate>(() => today(getLocalTimeZone()));
  // 보이는 달의 기준(react-aria 포커스 날짜) — 월 범위 쿼리의 suspense 리마운트에도 보이는 달을 보존한다.
  const [focusedDate, setFocusedDate] = useState<CalendarDate>(() => today(getLocalTimeZone()));
  const [creating, setCreating] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const { data: me } = useMe();
  const visibleMonthKey = startOfMonth(focusedDate).toString();

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
          resetKeys={[goalId, visibleMonthKey]}
        >
          <CalendarContent
            goalId={goalId}
            onChangeGoalId={changeGoalId}
            selectedDate={selectedDate}
            onChangeSelectedDate={setSelectedDate}
            focusedDate={focusedDate}
            onFocusChange={setFocusedDate}
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

/** 해당 달의 그리드 표시 범위(앞뒤 달 날짜 포함, 월요일 시작 주 단위)를 KST date 문자열로 반환. */
function gridRangeOf(month: CalendarDate, locale: string): { from: string; to: string } {
  const start = startOfMonth(month);
  return {
    from: startOfWeek(start, locale, 'mon').toString(),
    to: endOfWeek(endOfMonth(start), locale, 'mon').toString(),
  };
}

function CalendarContent({
  goalId,
  onChangeGoalId,
  selectedDate,
  onChangeSelectedDate,
  focusedDate,
  onFocusChange,
  onSelectTodo,
}: {
  goalId: number | null;
  onChangeGoalId: (goalId: number | null) => void;
  selectedDate: CalendarDate;
  onChangeSelectedDate: (date: CalendarDate) => void;
  focusedDate: CalendarDate;
  onFocusChange: (date: CalendarDate) => void;
  onSelectTodo: (todo: Todo) => void;
}) {
  const { locale } = useLocale();
  // 보이는 달의 그리드 범위만 서버에서 조회 — 방문한 달은 캐시돼 재방문 즉시.
  const { from, to } = gridRangeOf(focusedDate, locale);
  const { data } = useTodosInRange(from, to);
  // 인접 월은 백그라운드 프리페치해 월 이동 시 suspense 깜빡임을 줄인다.
  usePrefetchTodosInRange([
    gridRangeOf(startOfMonth(focusedDate).subtract({ months: 1 }), locale),
    gridRangeOf(startOfMonth(focusedDate).add({ months: 1 }), locale),
  ]);
  // 필터 드롭다운 — favorites 페이지와 동일 패턴 (공용 추출은 #150 범위 제외)
  const { data: goalData } = useGoalList({ limit: 100 });
  const goals = goalData?.goals ?? [];
  const selectedGoal = goals.find((g) => g.id === goalId) ?? null;

  // 목표 필터는 클라이언트(전환 즉시성). 범위는 서버가 거르지만 falsy dueDate 방어는 유지한다.
  const todosByDate = new Map<string, Todo[]>();
  for (const t of data.todos) {
    if (goalId !== null && t.goalId !== goalId) continue;
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
        focusedValue={focusedDate}
        onFocusChange={onFocusChange}
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
