---
name: git-workflow
description: INdigo 프로젝트의 Git 작업 전체 규칙 — 브랜치 전략·네이밍, 커밋 메시지 컨벤션, PR 작성 규칙. 브랜치를 만들거나, 커밋·푸시하거나, PR을 열기 직전에 반드시 이 스킬을 로드하세요. "커밋해줘", "브랜치 따줘", "PR 올려줘", "푸시해줘" 같은 요청이나 작업을 마무리해 변경사항을 반영하려 할 때 항상 사용합니다. 이 스킬이 INdigo Git 규칙의 단일 출처입니다 — CLAUDE.md에는 트리거용 한 줄 요약만 있습니다.
---

# Git Workflow (INdigo)

INdigo의 Git 작업 규칙 전체. 이 문서가 단일 출처다.

**대전제**

- 이슈 없이 작업을 시작하지 않는다. 모든 보조 브랜치는 착수한 GitHub 이슈에 대응한다.
- `main`/`dev`에 **직접 푸시 금지**. 모든 변경은 PR을 거친다.
- 브랜치 타입은 항상 커밋 타입과 일치시킨다 (`feature/*` ↔ `feat`, `fix/*` ↔ `fix`).

## 브랜치

- `main`: 출시 가능 상태
- `dev`: 다음 배포 개발 코드 (PR의 **기본 머지 대상**)
- 보조: `feature/*`, `fix/*`

**보조 브랜치 형식**: `<타입>/<이슈번호>-<기능명>`

- 예: `feature/42-user-authentication`
- `<이슈번호>`: 착수한 GitHub 이슈 번호 (필수, 이슈 없이 분기 금지)
- `<기능명>`: **kebab-case**, 3~5 단어 이내

## 작업 흐름

1. 이슈 단위로 `feature/<이슈번호>-<기능명>` 브랜치를 `dev`에서 분기
2. 작업 후 `origin`에 푸시
3. **`dev` 브랜치를 대상으로 PR** 생성
4. `dev` → `main` 머지는 **배포 시점에만** 수행

흐름 요약: 이슈 → `feature/*` 브랜치 → `dev` 대상 PR → 머지 시 이슈 종료.

## 커밋 메시지

**타입**: `feat` `fix` `docs` `style` `refactor` `test` `chore` `perf` `ci` `build` `revert`

본문은 영어로 무엇을·왜를 간략히. 명령형 현재 시제, 첫 글자 소문자, 끝에 마침표 없음.
관련 이슈는 본문에 `#<번호>`로 참조한다.

```
feat: add social login with kakao oauth

users can now sign in via kakao. token is stored
in an httponly cookie through the route handler

#42
```

## PR

- 제목 접두어 `[FEAT]` `[FIX]` 등 + 핵심 내용 (예: `[FEAT] 소셜 로그인 구현`)
- 본문은 `.github/pull_request_template.md` 템플릿을 따라 **한글**로 작성
- PR 템플릿 `## 관련 이슈`에 이슈 링크, 커밋/PR 본문에 `#<번호>` 참조
- 머지 대상은 `dev` (출시 시점에만 `dev` → `main`)
