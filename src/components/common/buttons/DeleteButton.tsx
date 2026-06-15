import { useTranslations } from 'next-intl';

import { IcDelete } from '@/src/components/common/icons/IcDelete';
import { cn } from '@/src/utils/cn';

type DeleteButtonSize = 'large' | 'small';

interface DeleteButtonProps {
  onClick?: () => void;
  size?: DeleteButtonSize;
  className?: string;
}

const sizeClasses: Record<DeleteButtonSize, string> = {
  large: 'size-6',
  small: 'size-[18px]',
};

const iconSizeClasses: Record<DeleteButtonSize, string> = {
  large: 'size-3',
  small: 'size-[10px]',
};

/**
 * 이미지 삭제 전용 버튼. 이미지 위에 absolute로 올려서 사용
 *
 * @param onClick   이미지 삭제 핸들러
 * @param size      버튼 크기. large(24px) | small(18px). 기본값 `"small"`
 * @param className 위치 지정용 Tailwind 클래스. 부모에 `relative`를 주고 `absolute top-2 right-2` 등으로 사용
 *
 * @example
 * <div className="relative">
 *   <img src={url} alt="" />
 *   <DeleteButton onClick={handleDelete} className="absolute right-2 top-2" />
 * </div>
 */
export default function DeleteButton({ onClick, size = 'small', className }: DeleteButtonProps) {
  const tCommon = useTranslations('common');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={tCommon('imageDelete')}
      className={cn(
        'z-10 flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white transition-colors hover:border-slate-400',
        sizeClasses[size],
        className,
      )}
    >
      <IcDelete className={iconSizeClasses[size]} />
    </button>
  );
}
