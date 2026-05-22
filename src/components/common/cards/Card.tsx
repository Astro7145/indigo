import { HTMLAttributes, KeyboardEvent, Ref } from 'react';

import { cn } from '@/src/utils/cn';

export type CardSize = 'large' | 'small';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 표면 크기. 패딩만 차이 — 너비/높이는 호출 측이 className으로 결정. 기본값 `"large"` */
  size?: CardSize;
  ref?: Ref<HTMLDivElement>;
}

/** size별 padding (Figma 토큰: large 32px, small 16px). small의 16~24px 범위는 도메인 카드가 className으로 override */
const sizeClasses: Record<CardSize, string> = {
  large: 'p-8',
  small: 'p-4',
};

/**
 * 도메인 무관 카드 표면(surface) 프리미티브
 *
 * "흰 배경 + 라운드 + 그림자 + 패딩" 표면 토큰만 책임지며, 너비/높이/내부 레이아웃은
 * 호출하는 도메인 카드(PostCard, NoteCard 등)가 결정한다.
 *
 * `onClick`을 전달하면 카드가 키보드 접근 가능한 버튼이 된다 — `role="button"`,
 * `tabIndex=0`, Enter/Space 키 활성화를 자동 부여(명시적으로 넘긴 `role`/`tabIndex`가
 * 우선). 별도 헬퍼 없이 Card에 내장.
 *
 * @param size      `"large"` | `"small"`. 패딩만 차이. 기본값 `"large"`
 * @param onClick   제공 시 카드를 버튼처럼 동작시킴(role/tabIndex/키보드 a11y 부착)
 * @param className 추가 Tailwind 클래스 (`cn()` 병합으로 기본 스타일 override 가능)
 * @param ref       내부 `<div>`에 직접 부착할 ref (React 19 — `forwardRef` 미사용)
 * @param children  카드 내부 콘텐츠
 *
 * @example
 * <Card size="large" className="w-[384px]" onClick={() => router.push(href)}>
 *   <h3>{post.title}</h3>
 * </Card>
 */
export default function Card({
  size = 'large',
  className,
  children,
  ref,
  onClick,
  role,
  tabIndex,
  onKeyDown,
  ...props
}: CardProps) {
  const interactive = onClick != null;
  return (
    <div
      ref={ref}
      onClick={onClick}
      role={role ?? (interactive ? 'button' : undefined)}
      tabIndex={tabIndex ?? (interactive ? 0 : undefined)}
      onKeyDown={
        interactive || onKeyDown
          ? (e: KeyboardEvent<HTMLDivElement>) => {
              onKeyDown?.(e);
              if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                e.currentTarget.click();
              }
            }
          : undefined
      }
      className={cn('rounded bg-white shadow-md', sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
