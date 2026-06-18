'use client';

import { useTranslations } from 'next-intl';

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
  showImageUpload?: boolean;
  showLink?: boolean;
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
  showImageUpload = true,
  showLink = true,
  className,
}: EditorToolbarProps) {
  const t = useTranslations('common.editor');
  return (
    <div
      className={cn(
        'dark:bg-indigo-dark-500 flex h-11 w-full items-center gap-0.5 rounded bg-slate-50 px-4 py-1.5',
        className,
      )}
    >
      <IconButton aria-label={t('bold')} title={t('bold')} hover={!state.isBold} onClick={onBold}>
        <IcTextBold state={state.isBold ? 'active' : 'default'} />
      </IconButton>
      <IconButton aria-label={t('italic')} title={t('italic')} hover={!state.isItalic} onClick={onItalic}>
        <IcTextItalic state={state.isItalic ? 'active' : 'default'} />
      </IconButton>
      <IconButton aria-label={t('underline')} title={t('underline')} hover={!state.isUnderline} onClick={onUnderline}>
        <IcTextUnderline state={state.isUnderline ? 'active' : 'default'} />
      </IconButton>

      <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-white/10" />

      <IconButton aria-label={t('alignLeft')} title={t('alignLeft')} hover={!state.isAlignLeft} onClick={onAlignLeft}>
        <IcTextAlignLeft state={state.isAlignLeft ? 'active' : 'default'} />
      </IconButton>
      <IconButton
        aria-label={t('alignCenter')}
        title={t('alignCenter')}
        hover={!state.isAlignCenter}
        onClick={onAlignCenter}
      >
        <IcTextAlignCenter state={state.isAlignCenter ? 'active' : 'default'} />
      </IconButton>
      <IconButton
        aria-label={t('alignRight')}
        title={t('alignRight')}
        hover={!state.isAlignRight}
        onClick={onAlignRight}
      >
        <IcTextAlignRight state={state.isAlignRight ? 'active' : 'default'} />
      </IconButton>
      <IconButton
        aria-label={t('bulletList')}
        title={t('bulletList')}
        hover={!state.isBulletList}
        onClick={onBulletList}
      >
        <IcTextDotPoints state={state.isBulletList ? 'active' : 'default'} />
      </IconButton>

      {showImageUpload && (
        <IconButton aria-label={t('insertImage')} title={t('insertImage')} onClick={onImageUpload}>
          <IcTextInsertImage />
        </IconButton>
      )}

      {showLink && (
        <IconButton aria-label={t('insertLink')} title={t('insertLink')} hover={!state.isLink} onClick={onLink}>
          <IcTextLink state={state.isLink ? 'active' : 'default'} />
        </IconButton>
      )}
    </div>
  );
}
