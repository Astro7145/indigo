import type { ComponentProps, ReactNode } from 'react';

jest.mock('@/src/api/todo', () => ({
  ...jest.requireActual('@/src/api/todo'),
  getTodos: jest.fn(),
}));

// motion: 등장 애니메이션은 시각 효과이므로 테스트에서는 단순 li로 통과시킨다.
// initial/animate/transition 등 motion 전용 prop은 DOM에 새지 않도록 제거한다.
jest.mock('motion/react', () => {
  const MOTION_PROPS = new Set(['initial', 'animate', 'transition', 'exit', 'whileHover', 'whileInView']);
  const stripMotion = (props: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(props).filter(([k]) => !MOTION_PROPS.has(k)));
  return {
    useReducedMotion: () => true,
    motion: {
      li: ({ children, ...rest }: ComponentProps<'li'> & Record<string, unknown>) => (
        <li {...(stripMotion(rest) as ComponentProps<'li'>)}>{children as ReactNode}</li>
      ),
    },
  };
});

import { act, fireEvent, screen, waitFor } from '@testing-library/react';

import * as todoApi from '@/src/api/todo';
import TodosPage from '@/app/(main)/todos/page';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';
import type { Todo, TodoListParams, TodoListResponse } from '@/src/types/todo';

const mocked = todoApi as jest.Mocked<typeof todoApi>;

const makeTodo = (id: number, title: string, done = false): Todo => ({
  id,
  teamId: 't',
  userId: 1,
  goalId: null,
  title,
  done,
  fileUrl: null,
  linkUrl: null,
  dueDate: null,
  createdAt: '2026-05-20T00:00:00Z',
  updatedAt: '2026-05-20T00:00:00Z',
  goal: null,
  noteIds: [],
  tags: [],
  isFavorite: false,
});

const page = (todos: Todo[], nextCursor: number | null, totalCount: number): TodoListResponse => ({
  todos,
  nextCursor,
  totalCount,
});

// 마지막으로 생성된 IO의 콜백을 직접 호출해 sentinel 교차를 시뮬레이트한다.
type IOCallback = (entries: IntersectionObserverEntry[]) => void;
let lastIoCallback: IOCallback | null = null;
class MockIO {
  callback: IOCallback;
  constructor(cb: IOCallback) {
    this.callback = cb;
    lastIoCallback = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = '';
  thresholds = [];
}

beforeEach(() => {
  jest.resetAllMocks();
  lastIoCallback = null;
  (globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
    MockIO as unknown as typeof IntersectionObserver;
});

it('헤더에 "모든 할 일" 제목과 totalCount 배지를 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(page([makeTodo(1, '할일 A')], null, 42));
  renderWithClient(<TodosPage />);
  expect(await screen.findByText('할일 A')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '모든 할 일' })).toBeInTheDocument();
  expect(screen.getByText('42')).toBeInTheDocument();
});

it('할일이 없으면 빈 상태 텍스트를 렌더한다', async () => {
  mocked.getTodos.mockResolvedValue(page([], null, 0));
  renderWithClient(<TodosPage />);
  expect(await screen.findByText('아직 등록한 할 일이 없어요')).toBeInTheDocument();
});

it('초기 호출은 done 미지정·sort=latest·limit=40으로 한다', async () => {
  mocked.getTodos.mockResolvedValue(page([makeTodo(1, '할일 A')], null, 1));
  renderWithClient(<TodosPage />);
  await screen.findByText('할일 A');
  const calledWith = mocked.getTodos.mock.calls[0]?.[0] as TodoListParams;
  expect(calledWith.sort).toBe('latest');
  expect(calledWith.limit).toBe(40);
  expect(calledWith.done).toBeUndefined();
});

it('TO DO 탭 클릭 시 done=false 파라미터로 다시 조회한다', async () => {
  mocked.getTodos.mockResolvedValue(page([makeTodo(1, '할일 A')], null, 1));
  renderWithClient(<TodosPage />);
  await screen.findByText('할일 A');
  fireEvent.click(screen.getByRole('button', { name: 'TO DO' }));
  await waitFor(() => {
    const lastArgs = mocked.getTodos.mock.calls.at(-1)?.[0] as TodoListParams;
    expect(lastArgs.done).toBe('false');
  });
});

it('DONE 탭 클릭 시 done=true 파라미터로 다시 조회한다', async () => {
  mocked.getTodos.mockResolvedValue(page([makeTodo(1, '할일 A')], null, 1));
  renderWithClient(<TodosPage />);
  await screen.findByText('할일 A');
  fireEvent.click(screen.getByRole('button', { name: 'DONE' }));
  await waitFor(() => {
    const lastArgs = mocked.getTodos.mock.calls.at(-1)?.[0] as TodoListParams;
    expect(lastArgs.done).toBe('true');
  });
});

it('+ 할 일 추가 버튼 클릭은 에러 없이 동작한다(스텁)', async () => {
  mocked.getTodos.mockResolvedValue(page([], null, 0));
  renderWithClient(<TodosPage />);
  await screen.findByText('아직 등록한 할 일이 없어요');
  // 스텁이므로 클릭만 검증 — onClick 핸들러 없이도 던지지 않아야 한다.
  expect(() => fireEvent.click(screen.getByRole('button', { name: '할 일 추가' }))).not.toThrow();
});

it('sentinel 교차 시 fetchNextPage가 호출되어 두 번째 페이지를 조회한다', async () => {
  mocked.getTodos
    .mockResolvedValueOnce(page([makeTodo(1, '할일 A')], 1, 2))
    .mockResolvedValueOnce(page([makeTodo(2, '할일 B')], null, 2));
  renderWithClient(<TodosPage />);
  await screen.findByText('할일 A');
  // IO가 sentinel을 관찰하기까지 effect 사이클 대기.
  await waitFor(() => expect(lastIoCallback).not.toBeNull());
  act(() => {
    lastIoCallback?.([{ isIntersecting: true } as IntersectionObserverEntry]);
  });
  expect(await screen.findByText('할일 B')).toBeInTheDocument();
});
