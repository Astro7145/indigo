# `src/api` 계층 + 8개 도메인 API·타입 설계

- 날짜: 2026-05-19
- 상태: 승인됨 (구현 대기)
- 명세 출처(SSOT): Swagger `https://slid-to-do-api.vercel.app/openapi.json` (Slid To-Do API v1.0.0)

## 1. 목적 / 범위

빈 `src/`에 API 계층의 기반과 8개 도메인의 순수 API 함수·쿼리 키·타입을 구축한다.

**범위 안**

- `src/api/axiosInstance.ts` — 단일 axios 클라이언트 (baseURL·인터셉터·에러 정규화·401 single-flight refresh 재시도)
- `src/api/authSeam.ts` — 인증 시임 (`getAccessToken` / `refreshAccessToken`)
- `src/api/<domain>.ts` × 8 — 순수 API 함수 + `<domain>Keys` 쿼리 키 팩토리
- `src/types/common.ts` + `src/types/<domain>.ts` × 8 — Swagger 기반 수기 타입
- `.env.example` 추가 및 `.gitignore` 예외
- Jest 단위 테스트 (TDD)

**범위 밖 (후속 이슈)**

- `src/hooks/<domain>.ts` (TanStack Query 훅) — 도메인별 UI 작업 이슈에서 진행
- HttpOnly 쿠키 / BFF 인증 실제 구현 — 별도 auth 이슈 (본 작업은 시임만 제공)
- 컴포넌트, 대시보드 화면

## 2. 도메인 분해 (실제 API 기준 8개)

CLAUDE.md 예시 목록은 비exhaustive(`...`)이며 실제 엔드포인트와 다르다. **실제 API 기준 8개**로 구성한다. `dashboard`는 별도 엔드포인트가 없으므로 파일을 만들지 않고, 대시보드 화면이 `todo`/`goal` 훅을 조합한다.

| 도메인 | 엔드포인트 |
|---|---|
| `auth` | POST signup / login / refresh / logout, POST oauth/{provider} |
| `goal` | GET·POST /goals, GET·PATCH·DELETE /goals/{goalId} |
| `todo` | GET·POST /todos, GET·PATCH·DELETE /todos/{todoId}, POST·DELETE /todos/{todoId}/favorites, GET /todos/favorites |
| `note` | GET·POST /notes, GET·PATCH·DELETE /notes/{noteId} |
| `user` | GET /users/check-nickname, GET·PATCH·DELETE /users/me, PATCH /users/me/password |
| `notification` | GET·PATCH·DELETE /notifications, PATCH·DELETE /notifications/{notificationId} |
| `post` | GET·POST /posts, GET·PATCH·DELETE /posts/{postId}, GET·POST /posts/{postId}/comments, PATCH·DELETE /posts/{postId}/comments/{commentId}, POST·DELETE /posts/{postId}/comments/{commentId}/likes |
| `upload` | POST /images, POST /files (presigned URL 발급) |

쿼리 파라미터 요약:
- `todo` 목록: `cursor, limit, goalId, sort(latest|dueSoon), done(true|false), keyword`
- `note` 목록: `cursor, limit, todoId, goalId, search, sort`
- `post` 목록: `cursor, limit, type, search` / 댓글: `cursor, limit, parentId`
- `goal`·`notification`·`todo/favorites` 목록: `cursor, limit`
- `user/check-nickname`: `name`

## 3. 모듈 레이아웃

```
src/api/
  axiosInstance.ts
  authSeam.ts
  auth.ts  goal.ts  todo.ts  note.ts  user.ts  notification.ts  post.ts  upload.ts
src/types/
  common.ts
  auth.ts  goal.ts  todo.ts  note.ts  user.ts  notification.ts  post.ts  upload.ts
```

경로 별칭 `@/*`(이미 `tsconfig.json`에 설정) 사용, 상대경로 금지.

## 4. axiosInstance.ts

- `baseURL: process.env.NEXT_PUBLIC_API_BASE_URL`. **teamId를 URL에 포함**한다 (예: `https://slid-to-do-api.vercel.app/<teamId>`). 따라서 도메인 함수의 경로는 `/{teamId}` 없이 `/todos`처럼 깔끔하게 작성한다.
- 환경변수 누락 시 모듈 로드 시점에 명확한 에러를 던진다 (조용한 `undefined` baseURL 금지).
- 기본 헤더 `Content-Type: application/json` (단, `upload`의 multipart는 함수에서 개별 지정).
- **요청 인터셉터**: `authSeam.getAccessToken()` 결과가 truthy면 `Authorization: Bearer <token>` 부착. 현재 시임은 `null` 반환 → 헤더 미부착이어도 정상 동작.
- **응답 인터셉터 — 에러 정규화**: 모든 실패를 `ApiError`(`status`, `code?`, `message`, `details?`)로 변환. axios 응답 에러·네트워크 에러·타임아웃 모두 포함.
- **응답 인터셉터 — 401 single-flight refresh 재시도**:
  - 401 수신 → `refreshAccessToken()` 호출 → 성공 시 원요청 1회 재시도.
  - 동시 다발 401은 **single-flight**: 진행 중인 refresh Promise를 공유, 1회만 트리거하고 나머지는 그 결과를 기다렸다 재시도.
  - 재시도는 요청당 1회로 제한 (무한 루프 방지 플래그).
  - `refreshAccessToken()`이 `NotImplementedError`를 던지면(현재 시임 상태) refresh를 시도하지 않고 원래 401 `ApiError`를 그대로 전파.
- **클라이언트 토큰 저장 금지**: 이 파일·시임 어디서도 `localStorage`/`sessionStorage`/`window`/Zustand에 토큰을 읽거나 쓰지 않는다 (CLAUDE.md 인증 규칙).
- 인스턴스는 default + named export.

## 5. authSeam.ts

단일 인증 확장 지점. 계약과 금지사항을 주석으로 명시한다.

- `getAccessToken(): Promise<string | null>` — 현재 항상 `null`. 추후 HttpOnly 쿠키 기반 서버 소스에서 토큰을 읽도록 교체.
- `refreshAccessToken(): Promise<void>` — 현재 `NotImplementedError`를 던진다. 추후 BFF refresh 엔드포인트 연동.
- 둘 다 클라이언트 스토리지 접근을 절대 하지 않는다는 규칙을 파일 주석으로 고정.

`NotImplementedError`는 `types/common.ts`에 정의해 인터셉터가 식별할 수 있게 한다.

## 6. 도메인 API 파일 패턴 (예: `todo.ts`)

- Swagger 명세대로 타입된 순수 함수. 예: `getTodos(params)`, `getTodo(todoId)`, `createTodo(body)`, `patchTodo(todoId, body)`, `deleteTodo(todoId)`, `addTodoFavorite(todoId)`, `removeTodoFavorite(todoId)`, `getFavoriteTodos(params)`.
- 모든 함수는 `axiosInstance`만 사용하고 응답 `data`를 `types/<domain>.ts` 타입으로 반환.
- **쿼리 키 팩토리** `todoKeys`를 같은 파일에서 export:
  - `all`, `lists()`, `list(filters)`, `details()`, `detail(id)`, `favorites(filters)` 형태.
  - 문자열 직접 작성 금지, 팩토리만 사용 (CLAUDE.md).
- 8개 도메인 모두 동일 패턴 (mutation 전용 도메인은 키 팩토리 최소화).

## 7. 타입

- 재사용 가능한 `components.schemas`가 명세에 없으므로 **도메인별로 수기 작성**.
- `types/common.ts`: `ApiError`, `NotImplementedError`, `CursorParams { cursor?: number; limit?: number }`.
- 응답 envelope는 도메인마다 키가 다르다 (`{ todos, nextCursor, totalCount }`, `{ notes, ... }` 등) → 공통 제네릭으로 강제하지 않고 각 `types/<domain>.ts`에 명시적으로 정의.
- `strict` 준수, `any` 금지, nullable 필드는 `| null` 명시.

## 8. 환경 변수

- `.env.example`에 추가:
  ```
  # 팀 식별자를 포함한 전체 base URL (예: https://slid-to-do-api.vercel.app/<teamId>)
  NEXT_PUBLIC_API_BASE_URL=
  ```
- `.gitignore`는 `.env*`를 전부 무시하므로 `!.env.example` 예외를 추가해 커밋 가능하게 한다. 실제 값은 `.env.local`(미커밋).

## 9. 테스트 (TDD)

Jest는 이미 `next/jest`로 설정됨(`jest.config.ts`, `jest.setup.ts`) — `@/` 별칭·`.env` 자동 처리. 별도 jest 설정 작업 불필요.

axios mock 기반 단위 테스트(테스트 우선 작성):

1. `axiosInstance` — 에러 정규화: 응답 에러/네트워크 에러/타임아웃이 `ApiError`로 매핑되는지.
2. `axiosInstance` — 401 single-flight: 동시 401 N건이 `refreshAccessToken`을 정확히 1회만 호출하고 각 원요청이 재시도되는지. 시임이 `NotImplementedError`면 refresh 미시도·원 401 전파.
3. `axiosInstance` 요청 인터셉터 — `getAccessToken()`이 토큰을 주면 `Authorization` 헤더가 붙고, `null`이면 안 붙는지.
4. 대표 도메인 1개(`todo`) — 함수가 올바른 경로·메서드·쿼리 직렬화·바디로 호출하는지, 쿼리 키 팩토리 출력 형태.

E2E(Playwright)는 범위 밖.

## 10. 리스크 / 메모

- teamId가 URL에 포함되므로 팀 변경 시 `.env.local`만 수정. 코드 변경 불필요.
- `upload`는 multipart/form-data로 presigned URL 발급 → 해당 함수에서 헤더 개별 처리. (presigned 후 실제 스토리지 PUT은 도메인 사용처 책임, 본 범위 밖)
- 시임이 inert인 동안 인증 필요한 호출은 401을 받게 되며, 이는 의도된 동작(컴포넌트/auth 이슈에서 채움).
- CLAUDE.md의 도메인 예시 목록과 실제 8개가 다르나, 사용자 결정에 따라 CLAUDE.md는 수정하지 않는다(코드만 실제 기준).
