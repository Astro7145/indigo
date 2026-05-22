import { ReactNode } from 'react';

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

interface ToolbarButtonProps {
  onClick?: () => void;
  title: string;
  isActive?: boolean;
  children: ReactNode;
}

function ToolbarButton({ onClick, title, isActive = false, children }: ToolbarButtonProps) {
  return (
    <IconButton aria-label={title} title={title} hover={!isActive} onClick={onClick}>
      {children}
    </IconButton>
  );
}

/**
 * 에디터 서식 툴바.
 *
 * @param state         각 버튼의 활성 상태
 * @param onBold        굵게 핸들러
 * @param onItalic      기울임 핸들러
 * @param onUnderline   밑줄 핸들러
 * @param onAlignLeft   왼쪽 정렬 핸들러
 * @param onAlignCenter 가운데 정렬 핸들러
 * @param onAlignRight  오른쪽 정렬 핸들러
 * @param onBulletList  목록 핸들러
 * @param onImageUpload 이미지 삽입 핸들러
 * @param onLink        링크 삽입 핸들러
 * @param className     추가 Tailwind 클래스
 */
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
      <ToolbarButton onClick={onBold} title="굵게" isActive={state.isBold}>
        <IcTextBold state={state.isBold ? 'active' : 'default'} />
      </ToolbarButton>
      <ToolbarButton onClick={onItalic} title="기울임" isActive={state.isItalic}>
        <IcTextItalic state={state.isItalic ? 'active' : 'default'} />
      </ToolbarButton>
      <ToolbarButton onClick={onUnderline} title="밑줄" isActive={state.isUnderline}>
        <IcTextUnderline state={state.isUnderline ? 'active' : 'default'} />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton onClick={onAlignLeft} title="왼쪽 정렬" isActive={state.isAlignLeft}>
        <IcTextAlignLeft state={state.isAlignLeft ? 'active' : 'default'} />
      </ToolbarButton>
      <ToolbarButton onClick={onAlignCenter} title="가운데 정렬" isActive={state.isAlignCenter}>
        <IcTextAlignCenter state={state.isAlignCenter ? 'active' : 'default'} />
      </ToolbarButton>
      <ToolbarButton onClick={onAlignRight} title="오른쪽 정렬" isActive={state.isAlignRight}>
        <IcTextAlignRight state={state.isAlignRight ? 'active' : 'default'} />
      </ToolbarButton>
      <ToolbarButton onClick={onBulletList} title="목록" isActive={state.isBulletList}>
        <IcTextDotPoints state={state.isBulletList ? 'active' : 'default'} />
      </ToolbarButton>

      <ToolbarButton onClick={onImageUpload} title="이미지 삽입">
        <IcTextInsertImage />
      </ToolbarButton>

      <ToolbarButton onClick={onLink} title="링크 삽입" isActive={state.isLink}>
        <IcTextLink state={state.isLink ? 'active' : 'default'} />
      </ToolbarButton>
    </div>
  );
}
