import Image from 'next/image';

import IconButton from '@/src/components/common/buttons/IconButton';
import { IcBadgeClose } from '@/src/components/common/icons/IcBadgeClose';

export interface PostImageAttachmentProps {
  src: string;
  alt?: string;
  onDelete: () => void;
}

export default function PostImageAttachment({ src, alt = '첨부 이미지', onDelete }: PostImageAttachmentProps) {
  // blob:/data: URL은 next/image 옵티마이저가 가져올 수 없어서 unoptimized로 그대로 렌더
  const isLocalPreview = src.startsWith('blob:') || src.startsWith('data:');
  return (
    <div className="relative h-[232px] w-[232px] overflow-hidden rounded">
      <Image src={src} alt={alt} fill className="object-cover" unoptimized={isLocalPreview} />
      <IconButton aria-label="이미지 삭제" className="absolute top-4 right-4" onClick={onDelete}>
        <IcBadgeClose />
      </IconButton>
    </div>
  );
}
