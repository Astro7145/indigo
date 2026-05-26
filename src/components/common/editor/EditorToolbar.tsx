import IconButton from '@/src/components/common/buttons/IconButton';
import { cn } from '@/src/utils/cn';
import { IcTextAlignCenter } from '@/src/components/common/icons/IcTextAlignCenter';
import { IcTextAlignLeft } from '@/src/components/common/icons/IcTextAlignLeft';
import { IcTextAlignRight } from '@/src/components/common/icons/IcTextAlignRight';
import { IcTextBold } from '@/src/components/common/icons/IcTextBold';
import { IcTextDotPoints } from '@/src/components/common/icons/IcTextDotPoints';
import { IcTextInsertImage } from '@/src/components/common/icons/IcTextInsertImage';
import { IcTextItalic } from '@/src/components/common/icons/IcTextItalic';
import { IcTextLink } from '@/src/components/common/icons/IcTextLink';
import { IcTextUnderline } from '@/src/components/common/icons/IcTextUnderline';

export interface EditorToolbarState {
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isAlignLeft?: boolean;
  isAlignCenter?: boolean;
  isAlignRight?: boolean;
  isBulletList?: boolean;
  isLink?: boolean;
}

interface EditorToolbarProps {
  state?: EditorToolbarState;
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
  onBulletList?: () => void;
  onImageUpload?: () => void;
  onLink?: () => void;
  className?: string;
}

export default function EditorToolbar({
  state = {},
  onBold,
  onItalic,
  onUnderline,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onBulletList,
  onImageUpload,
  onLink,
  className,
}: EditorToolbarProps) {
  return (
    <div className={cn('flex h-11 w-full items-center gap-0.5 rounded bg-slate-50 px-4 py-1.5', className)}>
      <IconButton aria-label="굵게" title="굵게" hover={!state.isBold} onClick={onBold}>
        <IcTextBold state={state.isBold ? 'active' : 'default'} />
      </IconButton>
      <IconButton aria-label="기울임" title="기울임" hover={!state.isItalic} onClick={onItalic}>
        <IcTextItalic state={state.isItalic ? 'active' : 'default'} />
      </IconButton>
      <IconButton aria-label="밑줄" title="밑줄" hover={!state.isUnderline} onClick={onUnderline}>
        <IcTextUnderline state={state.isUnderline ? 'active' : 'default'} />
      </IconButton>

      <div className="mx-1 h-5 w-px bg-slate-200" />

      <IconButton aria-label="왼쪽 정렬" title="왼쪽 정렬" hover={!state.isAlignLeft} onClick={onAlignLeft}>
        <IcTextAlignLeft state={state.isAlignLeft ? 'active' : 'default'} />
      </IconButton>
      <IconButton aria-label="가운데 정렬" title="가운데 정렬" hover={!state.isAlignCenter} onClick={onAlignCenter}>
        <IcTextAlignCenter state={state.isAlignCenter ? 'active' : 'default'} />
      </IconButton>
      <IconButton aria-label="오른쪽 정렬" title="오른쪽 정렬" hover={!state.isAlignRight} onClick={onAlignRight}>
        <IcTextAlignRight state={state.isAlignRight ? 'active' : 'default'} />
      </IconButton>
      <IconButton aria-label="목록" title="목록" hover={!state.isBulletList} onClick={onBulletList}>
        <IcTextDotPoints state={state.isBulletList ? 'active' : 'default'} />
      </IconButton>

      <IconButton aria-label="이미지 삽입" title="이미지 삽입" onClick={onImageUpload}>
        <IcTextInsertImage />
      </IconButton>

      <IconButton aria-label="링크 삽입" title="링크 삽입" hover={!state.isLink} onClick={onLink}>
        <IcTextLink state={state.isLink ? 'active' : 'default'} />
      </IconButton>
    </div>
  );
}
