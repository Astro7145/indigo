import { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/src/utils/cn';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  'aria-label': string;
  children: ReactNode;
  /** false이면 hover 스타일 비활성화. 기본값 true */
  hover?: boolean;
}

/**
 * 아이콘 전용 버튼. 기본 크기는 children 아이콘에 맞게 자동으로 결정되며, className으로 버튼 크기를 직접 지정할 수 있음
 *
 * @param aria-label 스크린리더용 레이블. 필수
 * @param hover      `false`이면 hover 스타일 비활성화. 기본값 `true`
 * @param children   아이콘 컴포넌트
 * @param className  추가 Tailwind 클래스
 *
 * @example
 * <IconButton aria-label="삭제">
 *   <IcDelete />
 * </IconButton>
 *
 * @example
 * // 클릭 이벤트
 * <IconButton aria-label="추가" onClick={() => handleAdd()}>
 *   <IcPlus className="text-slate-500" />
 * </IconButton>
 *
 * @example
 * // 호버 스타일 커스텀
 * <IconButton aria-label="노트" className="rounded-full hover:bg-slate-100">
 *   <IcNote />
 * </IconButton>
 *
 * @example
 * // 호버 비활성화
 * <IconButton aria-label="즐겨찾기" hover={false}>
 *   <IcStar />
 * </IconButton>
 */
export default function IconButton({
  'aria-label': ariaLabel,
  hover = true,
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded transition-colors select-none disabled:cursor-not-allowed disabled:opacity-50',
        hover && 'enabled:hover:bg-slate-100',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
