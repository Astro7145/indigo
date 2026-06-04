---
name: figma-integration
description: INdigo 프로젝트의 Figma MCP 연동 사용법 — 디자인을 참조하거나 화면을 구현할 때, 디자인 토큰을 확인할 때, 다이어그램을 만들 때 사용합니다. 사용자가 Figma 링크를 제공하거나 "이 디자인대로 구현", "피그마 보고 만들어줘", "이 화면 퍼블리싱" 같은 요청을 하면 반드시 이 스킬을 먼저 로드하세요. `use_figma`나 `generate_diagram` 류 Figma MCP 도구를 호출하기 전에 항상 사용해야 합니다.
---

# Figma 연동 (INdigo)

디자인 참조·구현 시 Figma MCP를 사용한다.

> **전제**: 이 스킬은 **Figma MCP 커넥터 연결**을 전제로 한다. 미연결 상태면 먼저 Claude Code에 Figma MCP를 연결한 뒤 사용한다 (`/figma-use` 등 Figma 스킬·`use_figma` 도구는 커넥터가 있어야 동작).

- **fileKey**: `4nokcUJykpeU7rSg5wILTN` (파일: _INsighty-SlidTodo_)
- 작업할 **개별 화면의 Figma 링크는 사용자가 제공**한다. 링크가 없으면 추측하지 말고 요청한다.

## 호출 전 선행 스킬

- `use_figma` 호출 전 → 반드시 `/figma-use` 스킬을 먼저 로드
- 다이어그램 생성 → `/figma-generate-diagram` 스킬을 먼저 로드

## 구현 시 주의

- 색상·타이포는 Figma에서 본 값을 **하드코딩하지 않는다**. `app/globals.css`의 디자인 토큰
  (Tailwind v4 `@theme`)에 정의된 브랜드 `indigo` 스케일과 `text-*` 토큰을 Tailwind 유틸리티로 매핑한다.
- 컴포넌트 라이브러리(shadcn 등)를 쓰지 않으므로, Figma 컴포넌트는 `src/components/`에 직접 구현한다.
