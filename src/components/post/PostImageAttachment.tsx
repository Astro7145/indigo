'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import IconButton from '@/src/components/common/buttons/IconButton';
import { IcBadgeClose } from '@/src/components/common/icons/IcBadgeClose';

export interface PostImageAttachmentProps {
  src: string;
  alt?: string;
  onDelete: () => void;
}

export default function PostImageAttachment({ src, alt, onDelete }: PostImageAttachmentProps) {
  const t = useTranslations('posts');
  // blob:/data: URL은 next/image 옵티마이저가 가져올 수 없어서 unoptimized로 그대로 렌더
  const isLocalPreview = src.startsWith('blob:') || src.startsWith('data:');
  return (
    <div className="relative h-[232px] w-[232px] overflow-hidden rounded">
      <Image src={src} alt={alt ?? t('form.imageAlt')} fill className="object-cover" unoptimized={isLocalPreview} />
      <IconButton aria-label={t('form.imageDeleteLabel')} className="absolute top-4 right-4" onClick={onDelete}>
        <IcBadgeClose />
      </IconButton>
    </div>
  );
}
