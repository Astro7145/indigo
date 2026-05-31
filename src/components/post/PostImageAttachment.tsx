import Image from 'next/image';

import IconButton from '@/src/components/common/buttons/IconButton';
import { IcBadgeClose } from '@/src/components/common/icons/IcBadgeClose';

export interface PostImageAttachmentProps {
  src: string;
  alt?: string;
  onDelete: () => void;
}

export default function PostImageAttachment({ src, alt = '첨부 이미지', onDelete }: PostImageAttachmentProps) {
  return (
    <div className="relative h-58 w-58 overflow-hidden rounded">
      <Image src={src} alt={alt} fill className="object-cover" />
      <IconButton aria-label="이미지 삭제" className="absolute top-4 right-4" onClick={onDelete}>
        <IcBadgeClose />
      </IconButton>
    </div>
  );
}
