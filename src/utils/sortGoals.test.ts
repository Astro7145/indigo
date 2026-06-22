import { sortGoals } from './sortGoals';
import type { GoalListItem } from '@/src/types/goal';

const makeGoal = (id: number, createdAt: string, todoCount = 0, completedCount = 0): GoalListItem => ({
  id,
  teamId: 't',
  userId: 1,
  title: `목표 ${id}`,
  createdAt,
  updatedAt: createdAt,
  todoCount,
  completedCount,
});

// 생성일이 서로 다른 세 목표
const a = makeGoal(1, '2026-01-01T00:00:00Z', 4, 1); // 진행률 25%
const b = makeGoal(2, '2026-03-01T00:00:00Z', 4, 4); // 진행률 100%
const c = makeGoal(3, '2026-02-01T00:00:00Z', 4, 0); // 진행률 0%

describe('sortGoals', () => {
  it('latest는 생성일 내림차순(최신 먼저)으로 정렬한다', () => {
    expect(sortGoals([a, b, c], 'latest').map((g) => g.id)).toEqual([2, 3, 1]);
  });

  it('oldest는 생성일 오름차순(오래된 먼저)으로 정렬한다', () => {
    expect(sortGoals([a, b, c], 'oldest').map((g) => g.id)).toEqual([1, 3, 2]);
  });

  it('progressHigh는 진행률 내림차순으로 정렬한다', () => {
    expect(sortGoals([a, b, c], 'progressHigh').map((g) => g.id)).toEqual([2, 1, 3]);
  });

  it('progressLow는 진행률 오름차순으로 정렬한다', () => {
    expect(sortGoals([a, b, c], 'progressLow').map((g) => g.id)).toEqual([3, 1, 2]);
  });

  it('todoCount가 0이면 진행률 0으로 취급한다', () => {
    const empty = makeGoal(4, '2026-04-01T00:00:00Z', 0, 0);
    // empty(0%)는 progressHigh에서 가장 뒤
    expect(sortGoals([b, empty], 'progressHigh').map((g) => g.id)).toEqual([2, 4]);
  });

  it('진행률이 같으면 생성일 내림차순으로 안정 정렬한다', () => {
    const x = makeGoal(10, '2026-01-01T00:00:00Z', 2, 1); // 50%
    const y = makeGoal(11, '2026-05-01T00:00:00Z', 2, 1); // 50%, 더 최신
    expect(sortGoals([x, y], 'progressHigh').map((g) => g.id)).toEqual([11, 10]);
  });

  it('입력 배열을 변형하지 않는다', () => {
    const input = [a, b, c];
    const before = input.map((g) => g.id);
    sortGoals(input, 'latest');
    expect(input.map((g) => g.id)).toEqual(before);
  });
});
