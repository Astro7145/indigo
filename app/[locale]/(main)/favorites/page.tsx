'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import Card from '@/src/components/common/cards/Card';
import Dropdown from '@/src/components/common/dropdown/Dropdown';
import { IcChevron } from '@/src/components/common/icons/IcChevron';
import { IcGoal } from '@/src/components/common/icons/IcGoal';
import TodoList from '@/src/components/common/todo-list/TodoList';
import CategoryTab from '@/src/components/todo/CategoryTab';
import { useFavoriteTodoList, useRemoveTodoFavorite } from '@/src/hooks/favorite';
import { useGoalList } from '@/src/hooks/goal';
import { useUpdateTodo } from '@/src/hooks/todo';

type Tab = 'all' | 'todo' | 'done';

/**
 * /favorites — 찜한 할 일 페이지
 * ALL/TO DO/DONE 탭 + 목표 필터 드롭다운, 행 등장 애니메이션.
 * `/todos`(무한 피드)와 달리 찜은 사용자가 직접 고른 소수 집합이고, favorites API가 `done`/`goalId`
 * 서버 필터를 주지 않는다(응답 `todo`는 전체 Todo·linkUrl 포함). 그래서 무한스크롤 대신 한 번에 전부
 * 불러와(`limit: 100`) 탭·목표 필터를 **클라이언트**에서 처리한다 — 전체가 로드돼 있어 필터·카운트가 정확하다.
 * 모바일은 GNB가 페이지 타이틀을 담당해 헤더 영역을 숨긴다.
 */
export default function FavoritesPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [goalId, setGoalId] = useState<number | null>(null);

  const { data, isLoading, isError } = useFavoriteTodoList({ limit: 100 });
  const update = useUpdateTodo();
  const removeFavorite = useRemoveTodoFavorite();
  const reduce = useReducedMotion();

  const favorites = data?.favorites ?? [];

  // 목표 드롭다운 옵션 (목표는 보통 소수 — 단일 페이지로 충분)
  const { data: goalData } = useGoalList({ limit: 100 });
  const goals = goalData?.goals ?? [];
  const selectedGoal = goals.find((g) => g.id === goalId) ?? null;

  // 클라이언트 필터 (favorites API가 done/goalId 미지원)
  const visible = favorites.filter((f) => {
    if (tab === 'todo' && f.todo.done) return false;
    if (tab === 'done' && !f.todo.done) return false;
    if (goalId !== null && f.todo.goal?.id !== goalId) return false;
    return true;
  });

  const toggle = (todoId: number, done: boolean) => update.mutate({ todoId, body: { done } });
  const unfavorite = (todoId: number) => removeFavorite.mutate(todoId);

  return (
    <section className="mx-auto flex w-full max-w-180 flex-col gap-6">
      {/* 모바일은 GNB가 페이지 타이틀을 담당 → sm+ 에서만 헤더 노출 (Figma 21209:61509) */}
      <div className="hidden items-baseline gap-4 px-2 sm:flex">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-800">찜한 할 일</h1>
        {/* 카운트는 현재 보이는(필터된) 찜 개수 — 탭·목표 필터에 따라 갱신. aria-label 미부착으로 h1+숫자를 이어 읽힘 */}
        <span className="text-2xl font-semibold tracking-[-0.03em] text-indigo-600">{visible.length}</span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-2">
          <CategoryTab label="ALL" isActive={tab === 'all'} onClick={() => setTab('all')} />
          <CategoryTab label="TO DO" isActive={tab === 'todo'} onClick={() => setTab('todo')} />
          <CategoryTab label="DONE" isActive={tab === 'done'} onClick={() => setTab('done')} />
        </div>

        <Card className="border border-slate-200 p-4 shadow-[0_2px_4px_0_rgba(0,0,0,0.04)] sm:p-8">
          {/* 목표 필터 드롭다운 (Figma 21209:61520) — `/todos`엔 없는 신규 요소 */}
          <Dropdown className="mb-5">
            <Dropdown.Trigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-sm border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <span className="flex items-center gap-3">
                  <IcGoal className="size-8" />
                  <span className="text-base font-semibold tracking-[-0.03em] text-slate-800">
                    {selectedGoal ? selectedGoal.title : '전체 목표'}
                  </span>
                </span>
                <IcChevron direction="down" />
              </button>
            </Dropdown.Trigger>
            <Dropdown.Menu size="full">
              <Dropdown.Item onClick={() => setGoalId(null)}>전체 목표</Dropdown.Item>
              {goals.map((g) => (
                <Dropdown.Item key={g.id} onClick={() => setGoalId(g.id)}>
                  {g.title}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {isLoading ? (
            <p className="py-12 text-center text-sm text-slate-400">불러오는 중…</p>
          ) : isError ? (
            <p className="py-12 text-center text-sm text-slate-400">불러오지 못했어요</p>
          ) : visible.length === 0 ? (
            <p className="py-20 text-center text-sm text-slate-500">아직 찜한 할 일이 없어요</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {visible.map((f, idx) => {
                // 타입상 noteIds는 number[] required지만, 백엔드 응답이 누락/null인 케이스를 방어한다.
                const hasNote = (f.todo.noteIds?.length ?? 0) > 0;
                const hasLink = !!f.todo.linkUrl;
                return (
                  <motion.li
                    key={f.id}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut', delay: Math.min(idx * 0.015, 0.3) }}
                    className="rounded transition-shadow hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.08)]"
                  >
                    <TodoList
                      title={f.todo.title}
                      checked={f.todo.done}
                      onCheckedChange={(done) => toggle(f.todoId, done)}
                    >
                      <TodoList.Actions>
                        {hasNote && <TodoList.NoteAction />}
                        {hasLink && <TodoList.LinkAction />}
                        {!hasNote && <TodoList.EditAction hoverOnly aria-label="노트 작성" />}
                        <TodoList.KebabAction hoverOnly />
                        <TodoList.StarAction active onClick={() => unfavorite(f.todoId)} />
                      </TodoList.Actions>
                    </TodoList>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </section>
  );
}
