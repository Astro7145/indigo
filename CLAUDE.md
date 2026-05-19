# CLAUDE.md

이 파일은 이 저장소에서 작업하는 Claude Code를 위한 가이드입니다.

## 프로젝트 개요

**INdigo** — 할일·목표·노트·소통 게시판을 관리하는 생산성 서비스.

- 4인 팀 프로젝트
- 기획·디자인은 **이미 확정**되어 있음. 단일 출처(SSOT): 기획·작업 단위는 **GitHub Issues**, 디자인은 **Figma**
- 레포지토리: https://github.com/Astro7145/indigo

## 기술 스택

- **TypeScript** (strict)
- **React 19**
- **Next.js 16** (App Router)
- **Tailwind CSS v4** — `shadcn` 등 컴포넌트 라이브러리 **사용 안 함**, 직접 구현
- **TanStack Query** — 서버 상태
- **axios** — HTTP 클라이언트 (`src/api/axiosInstance.ts` 단일 인스턴스)
- **Zustand** — 클라이언트 전역 상태
- **react-hook-form** — 폼
- **테스트**: Jest / React Testing Library (단위·통합), Playwright (E2E)

## 명령어

```bash
npm run dev         # 개발 서버 (http://localhost:3000)
npm run build       # 프로덕션 빌드
npm run start       # 프로덕션 서버
npm run lint        # ESLint
npm test            # 단위·통합 (Jest)
npm run test:watch  # Jest watch 모드
npm run test:e2e    # E2E (Playwright)
```

## 디렉터리 & 경로 별칭

- `app/` — Next.js App Router **라우팅 전용** (page·layout·route handler·loading/error)
- `src/` — 애플리케이션 코드. **계층(layer) 기반, 도메인별 분리**:

  ```
  src/
    components/
      common/        # 도메인 무관 공용 UI (Button, Modal ...)
      <domain>/      # 도메인 전용 컴포넌트 (auth, goal, todo, note, user, notification, post, upload)
    hooks/
      <domain>.ts    # 도메인별 커스텀 훅 (도메인당 단일 파일)
    api/
      axiosInstance.ts  # 공용 HTTP 클라이언트 (baseURL·인터셉터·에러 공통화)
      <domain>.ts       # 도메인별 API 함수 + 쿼리 키 (단일 파일)
    stores/           # 전역 Zustand 스토어 (theme, sidebar ... 도메인별로 안 나눔)
    types/
      common.ts      # 공용 타입
      <domain>.ts    # 도메인별 타입
    utils/            # 순수 유틸 함수
  ```

  - 도메인은 실제 API 기준 `auth, goal, todo, note, user, notification, post, upload` 8개 (SSOT: Swagger). **도메인 무관 공용은 각 계층에서 `common`** (`components/common/`, `types/common.ts`)
  - 한 도메인 작업은 `components/<domain>` · `hooks/<domain>.ts` · `api/<domain>.ts` · `types/<domain>.ts`에 걸쳐 있다. 스토어는 도메인별로 안 나누고 전역만 `stores/`에 둔다
  - 타인이 담당하는 도메인 파일은 합의 없이 수정하지 않는다 (R&R 영역 존중)

- **파일 네이밍**: 컴포넌트 `PascalCase.tsx` / 훅 `useXxx.ts` / 그 외 `camelCase.ts`.
  컴포넌트는 단일 파일로 시작, 커지면 같은 이름의 폴더로 분리
- 경로 별칭: `@/*` → 저장소 루트 (`tsconfig.json` 참조). 상대경로 `../../` 대신 `@/` 사용

## 코딩 컨벤션

- TypeScript `strict` 준수. `any` 지양, 타입 우선
- Next.js App Router 패턴 준수 (Server/Client Component 구분, `"use client"` 최소화)
- 포맷은 Prettier가 담당하며 규칙의 SSOT는 `.prettierrc` (수동 나열 금지, `npm run lint`로 검증).
  Tailwind 클래스는 `prettier-plugin-tailwindcss`가 자동 정렬
- **색상·타이포는 하드코딩 금지.** `app/globals.css`의 디자인 토큰(Tailwind v4 `@theme`)에
  정의된 브랜드 `indigo` 스케일과 `text-*` 토큰을 Tailwind 유틸리티로 사용

## API & 환경 변수

- API 명세(Swagger): https://slid-to-do-api.vercel.app/docs
- 도메인별 API 함수·쿼리 키는 `src/api/<domain>.ts`, 이를 TanStack Query로 감싼 커스텀 훅은 `src/hooks/<domain>.ts`에 둔다(둘 다 도메인당 단일 파일). 컴포넌트는 `fetch`/`axios`/`useQuery`를 직접 호출하지 않고 **커스텀 훅만** 사용한다 (HTTP 클라이언트 단일 인스턴스는 `src/api/axiosInstance.ts`)
- 환경 변수
  - 실제 값은 `.env.local`에 두며 **커밋하지 않는다** (`.gitignore` 확인)
  - 키 목록은 `.env.example`에 빈 값으로 커밋해 팀이 공유
  - 브라우저에 노출되는 변수만 `NEXT_PUBLIC_` 접두어 사용
- **인증 토큰**: Next.js 서버(Route Handler/Server Action)를 통해 **HttpOnly 쿠키**로 저장한다.
  토큰을 클라이언트 JS(localStorage·Zustand 등)에 보관 금지. _(아직 미구현 — 구현 시 이 방식 준수)_

## 상태 관리

**TanStack Query — 서버 상태**

- 서버에서 오는 모든 데이터는 Query로 관리한다 (서버 데이터를 Zustand/`useState`에 복사 금지)
- **모든 query/mutation은 커스텀 훅으로 감싸** `hooks/<domain>.ts`에 두고(예: `useTodoList`, `useCreateTodo`), 컴포넌트는 그 훅만 사용한다
- 쿼리 키는 도메인별 키 팩토리로 관리 (예: `todoKeys.list(filters)`), 문자열 직접 작성 지양
- 변경(mutation) 성공 후 관련 키를 `invalidateQueries`로 무효화
- 무한 스크롤(전체 할일·게시판 등)은 `useInfiniteQuery` 사용

**Zustand — 클라이언트 상태**

- UI/세션성 전역 상태만 담는다 (모달 open, 사이드바, 테마, 토스트 등)
- 서버 데이터·폼 상태는 넣지 않는다 (각각 Query·react-hook-form 담당)
- 스토어는 `src/stores/`에 전역 단위로만 둔다 (도메인별로 나누지 않음)

## 이슈 기반 작업 흐름

모든 작업은 **착수 전 GitHub 이슈**가 있어야 한다. 이슈가 그 작업의 단일 출처(SSOT)다.
기능 명세(예: `TODO_01_01`, `LOGIN_01_03`)는 이 문서가 아니라 **이슈 본문**에 둔다 —
불명확하면 추측하지 말고 사용자에게 요청한다.

**진입 경로**

- **기존 이슈**: 사용자가 이슈 링크/번호를 제공하면 `gh issue view <번호>`로 본문을 읽고, 그 이슈를 명세로 삼아 구현한다. 추측 금지 — 불명확하면 사용자에게 질문한다
- **신규 작업**: 이슈가 없으면 **먼저 `superpowers:brainstorming`으로 요구사항을 정리**한다. 사용자가 설계를 승인하면, 그 결과를 알맞은 이슈 템플릿에 채워 Claude가 `gh issue create`로 등록한 뒤 그 이슈로 구현한다

**brainstorming 연계** — 승인된 설계는 별도 spec 문서가 아니라 **GitHub 이슈 본문**으로 남긴다. 설계 승인 → 이슈 생성 → (필요 시 `writing-plans`) → 구현 순서.

**템플릿 매핑** (`.github/ISSUE_TEMPLATE/`)

- `feat` → `feature_request.md`
- `fix` → `bug_report.md`
- `chore` → `chore-request.md`

**연결**

- 브랜치·커밋·PR은 해당 이슈를 참조한다 (PR 템플릿 `## 관련 이슈`에 링크, 커밋/PR 본문에 `#<번호>`)
- 이슈 → `feature/*` 브랜치 → `dev` 대상 PR → 머지 시 이슈 종료

## Git 규칙

**브랜치**

- `main`: 출시 가능 상태 / `dev`: 다음 배포 개발 코드 (PR의 기본 머지 대상)
- 보조: `feature/*` `fix/*` (브랜치 타입은 커밋 타입과 일치시킨다)
- 보조 브랜치는 **`<타입>/<이슈번호>-<기능명>`** 형식 (예: `feature/42-user-authentication`)
  - `<이슈번호>`: 착수한 GitHub 이슈 번호 (이슈 없이 작업 시작 금지)
  - `<기능명>`: **kebab-case**, 3~5 단어 이내

**작업 흐름**

- 이슈 단위로 `feature/<이슈번호>-<기능명>` 브랜치를 `dev`에서 분기해 작업
- 작업 후 `origin`에 푸시하고, **`dev` 브랜치를 대상으로 PR** 생성
- `dev` → `main` 머지는 배포 시점에만 수행
- `main`/`dev`에 직접 푸시 금지. 모든 변경은 PR을 거침

**커밋 메시지**

- 타입: `feat` `fix` `docs` `style` `refactor` `test` `chore` `perf` `ci` `build` `revert`
- 본문은 영어로 무엇을·왜를 간략히. 명령형 현재 시제, 첫 글자 소문자, 끝에 마침표 없음

**PR**

- 제목 접두어 `[FEAT]` `[FIX]` 등 + 핵심 내용 (예: `[FEAT] 소셜 로그인 구현`)
- 본문은 `.github/pull_request_template.md` 템플릿을 따라 한글로 작성.

## Figma 연동 (MCP)

디자인 참조·구현 시 Figma MCP를 사용합니다.

- fileKey: `4nokcUJykpeU7rSg5wILTN` (파일: _INsighty-SlidTodo_)
- 작업할 화면의 Figma 링크는 사용자가 제공
- `use_figma` 호출 전에는 반드시 `/figma-use` 스킬을, 다이어그램은 `/figma-generate-diagram`
  스킬을 먼저 로드할 것

## 작업 방식

- **superpowers 플러그인(스킬)을 적극 사용합니다.** 기능 구현·버그 수정·계획 수립 전 관련 스킬을
  먼저 호출하세요: `brainstorming` → `writing-plans` → `test-driven-development` →
  `verification-before-completion` 등 (이슈 생성·구현 진입은 `## 이슈 기반 작업 흐름` 참조)
