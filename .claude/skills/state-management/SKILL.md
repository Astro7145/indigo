---
name: state-management
description: INdigo 프로젝트의 상태 관리 구현 상세 — TanStack Query(서버 상태)와 Zustand(클라이언트 상태)의 구체적 패턴, 쿼리 키 팩토리, 커스텀 훅 작성법, 무한 스크롤. 데이터 페칭 훅을 만들거나, query/mutation을 작성하거나, 쿼리 키를 정의하거나, Zustand 스토어를 추가하거나, 무한 스크롤을 구현할 때 이 스킬을 사용하세요. "API 연동", "데이터 불러오기", "훅 만들어줘", "스토어 추가", "무한스크롤" 같은 요청에 항상 사용합니다. CLAUDE.md에는 Query vs Zustand 분리 원칙만 있고, 구현 패턴·예시는 여기 있습니다.
---

# 상태 관리 구현 패턴 (INdigo)

원칙(어디에 무엇을 둘지)은 CLAUDE.md `## 상태 관리`에 있다. 이 스킬은 **어떻게 짜는지**를 다룬다.

## TanStack Query — 서버 상태

도메인별 API 함수·쿼리 키는 `src/api/<domain>.ts`, 이를 감싼 커스텀 훅은 `src/hooks/<domain>.ts`
(둘 다 도메인당 단일 파일). 컴포넌트는 `fetch`/`axios`/`useQuery`를 직접 호출하지 않고 **커스텀 훅만** 쓴다.

### 쿼리 키 팩토리

문자열을 직접 쓰지 않고 도메인별 키 팩토리로 관리한다.

```ts
// src/api/todo.ts
export const todoKeys = {
  all: ['todo'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: TodoFilters) => [...todoKeys.lists(), filters] as const,
  detail: (id: number) => [...todoKeys.all, 'detail', id] as const,
};
```

### 커스텀 훅

모든 query/mutation은 커스텀 훅으로 감싸 `hooks/<domain>.ts`에 둔다.

```ts
// src/hooks/todo.ts
export function useTodoList(filters: TodoFilters) {
  return useQuery({
    queryKey: todoKeys.list(filters),
    queryFn: () => getTodos(filters),
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      // 성공 후 관련 키 무효화
      qc.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}
```

### 규칙

- 서버에서 오는 모든 데이터는 Query로 관리 (Zustand/`useState`에 복사 금지)
- mutation 성공 후 관련 키를 `invalidateQueries`로 무효화
- 무한 스크롤(전체 할일·게시판 등)은 `useInfiniteQuery` 사용

## Zustand — 클라이언트 상태

UI/세션성 전역 상태만 담는다 (모달 open, 사이드바, 테마, 토스트 등).
서버 데이터·폼 상태는 넣지 않는다 (각각 Query·react-hook-form 담당).
스토어는 `src/stores/`에 **전역 단위로만** 둔다 (도메인별로 나누지 않음).

```ts
// src/stores/sidebar.ts
export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
```
