jest.mock('@/src/api/goal', () => ({
  ...jest.requireActual('@/src/api/goal'),
  getAllGoals: jest.fn(),
}));
jest.mock('@/src/api/todo', () => ({
  ...jest.requireActual('@/src/api/todo'),
  getAllTodos: jest.fn(),
}));

import * as goalApi from '@/src/api/goal';
import * as todoApi from '@/src/api/todo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { Suspense, type ReactNode } from 'react';
import { useGraphData } from '@/src/hooks/graph';

const mGoal = goalApi as jest.Mocked<typeof goalApi>;
const mTodo = todoApi as jest.Mocked<typeof todoApi>;

beforeEach(() => jest.resetAllMocks());

it('useGraphData는 전체 목표·할일을 반환한다', async () => {
  mGoal.getAllGoals.mockResolvedValue({ goals: [{ id: 1 }], nextCursor: null, totalCount: 1 } as never);
  mTodo.getAllTodos.mockResolvedValue({ todos: [{ id: 10, goalId: 1 }], nextCursor: null, totalCount: 1 } as never);

  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <Suspense fallback={null}>{children}</Suspense>
    </QueryClientProvider>
  );
  const { result } = renderHook(() => useGraphData(), { wrapper });

  await waitFor(() => expect(result.current.goals).toHaveLength(1));
  expect(result.current.todos).toHaveLength(1);
  expect(mTodo.getAllTodos).toHaveBeenCalledWith({});
});
