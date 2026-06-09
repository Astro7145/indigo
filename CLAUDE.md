# CLAUDE.md

이 파일은 이 저장소에서 작업하는 Claude Code를 위한 가이드입니다.

## 프로젝트 개요

**INdigo** — 할일·목표·노트·소통 게시판을 관리하는 생산성 서비스.

- 4인 팀 프로젝트
- 기획·디자인은 **이미 확정**되어 있음. 단일 출처(SSOT): 기획·작업 단위는 **GitHub Issues**, 디자인은 **Figma**
- 레포지토리: https://github.com/Astro7145/indigo

## 기술 스택

- **TypeScript** (strict)
- **React 19.2** — **React Compiler 사용**
- **Next.js 16** (App Router)
- **Tailwind CSS v4** — `shadcn` 등 컴포넌트 라이브러리 **사용 안 함**, 직접 구현
- **TanStack Query** — 서버 상태
- **axios** — HTTP 클라이언트
- **Zustand** — 클라이언트 전역 상태
- **react-hook-form** — 폼
- **Motion** — 애니메이션 라이브러리
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
      <domain>/      # 도메인 전용 컴포넌트
    hooks/
      <domain>.ts    # 도메인별 커스텀 훅 (도메인당 단일 파일)
    api/
      client-fetcher.ts  # 공용 HTTP 클라이언트 (baseURL·인터셉터·에러 공통화)
      <domain>.ts       # 도메인별 API 함수 + 쿼리 키 (단일 파일)
    stores/           # 전역 Zustand 스토어 (theme, sidebar ... 도메인별로 안 나눔)
    types/
      common.ts      # 공용 타입
      <domain>.ts    # 도메인별 타입
    utils/            # 순수 유틸 함수
  ```

  - 도메인은 실제 API 기준 `auth, goal, favorite, todo, note, user, notification, post, comment, upload` 10개 (SSOT: Swagger). **도메인 무관 공용은 각 계층에서 `common`** (`components/common/`, `types/common.ts`)
  - 한 도메인 작업은 `components/<domain>` · `hooks/<domain>.ts` · `api/<domain>.ts` · `types/<domain>.ts`에 걸쳐 있다. 스토어는 도메인별로 안 나누고 전역만 `stores/`에 둔다
  - 타인이 담당하는 도메인 파일은 합의 없이 수정하지 않는다 (R&R 영역 존중)

- **파일 네이밍**: 컴포넌트 `PascalCase.tsx` / 훅 `useXxx.ts` / 그 외 `camelCase.ts`.
  컴포넌트는 단일 파일로 시작, 커지면 같은 이름의 폴더로 분리
- 경로 별칭: `@/*` → 저장소 루트 (`tsconfig.json` 참조). 상대경로 `../../` 대신 `@/` 사용

## 코딩 컨벤션

- TypeScript `strict` 준수. `any` 지양, 타입 우선
- Next.js App Router 패턴 준수 (Server/Client Component 구분, `"use client"` 최소화)
- **React Compiler가 메모이제이션을 담당하므로 `useMemo`·`useCallback`을 수동으로 쓰지 않는다** (외부 라이브러리 요구 등 불가피한 경우만 예외, 이유 명시)
- 포맷은 Prettier가 담당하며 규칙의 SSOT는 `.prettierrc` (수동 나열 금지, `npm run lint`로 검증).
  Tailwind 클래스는 `prettier-plugin-tailwindcss`가 자동 정렬
- **반응형 브레이크포인트**: 모바일 `~639px` / 태블릿 `640px~1279px`(`sm`) / 데스크탑 `1280px~`(`xl`)
- **색상·타이포는 하드코딩 금지.** `app/globals.css`의 디자인 토큰(Tailwind v4 `@theme`)에
  정의된 브랜드 `indigo` 스케일과 `text-*` 토큰을 Tailwind 유틸리티로 사용
- 테스트는 `test`가 아닌 **`it`**으로 작성하고, 설명 문구는 **한글**로 간략히

## 코드 작성 행동 원칙

LLM 코딩의 흔한 실수를 줄이기 위한 행동 가이드. 사소한 작업에는 판단에 맡기되, 기본적으로 속도보다 신중함에 무게를 둔다.

### 1. Think Before Coding — 추측·혼란 숨김 금지, 트레이드오프 표면화

구현 전:

- 가정을 명시한다. 불확실하면 묻는다.
- 해석이 여러 갈래면 임의로 고르지 말고 제시한다.
- 더 단순한 방법이 있으면 말한다. 필요하면 반대 의견을 낸다.
- 불명확하면 멈춘다. 무엇이 헷갈리는지 짚고 묻는다.

### 2. Simplicity First — 문제를 푸는 최소 코드, 추측성 구현 금지

- 요청 범위를 넘는 기능 금지.
- 단발성 코드에 추상화 금지.
- 요청하지 않은 "유연성"·"설정 가능성" 금지.
- 일어나지 않을 시나리오의 에러 처리 금지.
- 200줄을 짰는데 50줄로 가능하면 다시 쓴다.
  스스로 묻는다: "시니어 엔지니어가 이걸 과하다고 할까?" 그렇다면 단순화한다.

### 3. Surgical Changes — 꼭 필요한 곳만 건드리고, 내가 만든 흔적만 치운다

기존 코드 편집 시:

- 인접 코드·주석·포맷을 멋대로 "개선"하지 않는다.
- 망가지지 않은 걸 리팩토링하지 않는다.
- 내 취향과 달라도 기존 스타일을 따른다.
- 관련 없는 데드 코드를 발견하면 삭제하지 말고 언급만 한다.

내 변경이 고아(orphan)를 만들면:

- 내 변경으로 안 쓰이게 된 import/변수/함수는 제거한다.
- 기존부터 있던 데드 코드는 요청 없이 제거하지 않는다.

기준: 바뀐 모든 줄은 사용자 요청으로 직접 추적돼야 한다.

### 4. Goal-Driven Execution — 성공 기준을 정하고, 검증될 때까지 반복

작업을 검증 가능한 목표로 변환:

- "검증 추가" → "잘못된 입력에 대한 테스트를 쓰고, 통과시킨다"
- "버그 수정" → "버그를 재현하는 테스트를 쓰고, 통과시킨다"
- "X 리팩토링" → "전후로 테스트가 통과하는지 보장한다"

여러 단계 작업은 간단한 계획을 먼저 말한다:

```
1. [단계] → 검증: [확인]
2. [단계] → 검증: [확인]
3. [단계] → 검증: [확인]
```

강한 성공 기준은 독립적으로 루프를 돌게 한다. 약한 기준("동작하게 해줘")은 끊임없는 재확인을 부른다.

> 이 원칙들이 작동하고 있다는 신호: diff에 불필요한 변경이 줄고, 과한 구현으로 인한 재작성이 줄고, 명확화 질문이 실수 후가 아니라 구현 전에 나온다.

## API & 환경 변수

- API 명세(Swagger): https://slid-to-do-api.vercel.app/docs
- 도메인별 API 함수·쿼리 키는 `src/api/<domain>.ts`, 이를 TanStack Query로 감싼 커스텀 훅은 `src/hooks/<domain>.ts`에 둔다(둘 다 도메인당 단일 파일). 컴포넌트는 `fetch`/`axios`/`useQuery`를 직접 호출하지 않고 **커스텀 훅만** 사용한다.
- 환경 변수
  - 실제 값은 `.env`에 두며 **커밋하지 않는다** (`.gitignore`가 `.env*` 무시, `!.env.example`만 예외)
  - 키 목록은 `.env.example`에 빈 값으로 커밋해 팀이 공유
  - 브라우저에 노출되는 변수만 `NEXT_PUBLIC_` 접두어 사용
- **인증 토큰**: Next.js 서버(Route Handler/Server Action)를 통해 **HttpOnly 쿠키**로 저장한다.
  토큰을 클라이언트 JS(localStorage·Zustand 등)에 보관 금지.

## 상태 관리 (원칙)

> 구현 패턴·쿼리 키 팩토리·커스텀 훅 작성법·무한 스크롤 등 상세는 **`state-management` 스킬**을 로드해 참고한다.

- 서버 상태=TanStack Query, 클라이언트 UI 상태=Zustand. 서버 데이터를 Zustand/useState에 복사 금지.

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

## Git 규칙 (핵심)

> 브랜치 네이밍·커밋 타입·PR 형식 등 상세는 **`git-workflow` 스킬**을 로드해 참고한다.

- main/dev 직접 푸시 금지, 모든 변경은 PR을 거친다. 이슈 없이 작업 시작 금지.

## Figma 연동

> fileKey·MCP 호출 절차·디자인 토큰 매핑 등 상세는 **`figma-integration` 스킬**을 로드해 참고한다.

## 작업 방식

- **superpowers 플러그인(스킬)을 적극 사용합니다.** 기능 구현·버그 수정·계획 수립 전 관련 스킬을
  먼저 호출하세요: `brainstorming` → `writing-plans` → `test-driven-development` →
  `verification-before-completion` 등 (이슈 생성·구현 진입은 `## 이슈 기반 작업 흐름` 참조)
- **프로젝트 로컬 스킬**도 함께 사용합니다: 커밋·PR 작업은 `git-workflow`, Figma 작업은
  `figma-integration`, 데이터 페칭·상태 코드는 `state-management` 스킬을 먼저 로드하세요.
