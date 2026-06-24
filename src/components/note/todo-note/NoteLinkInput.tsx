'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import IconButton from '@/src/components/common/buttons/IconButton';
import { IcDelete } from '@/src/components/common/icons';
import Modal from '@/src/components/common/modal/Modal';
import { isValidLinkUrl, normalizeUrl } from '@/src/utils/url';

interface NoteLinkInputProps {
  /** 기존에 첨부된 링크가 있으면 prefill (없으면 빈 문자열) */
  initialUrl: string;
  /** 확인 클릭 시 검증된 URL과 함께 호출 */
  onConfirm: (url: string) => void;
  /** 닫기(X) 클릭 시 호출 */
  onClose: () => void;
}

// 노트에 첨부할 링크를 입력받는 다이얼로그. Modal shell(ModalStack)이 씌워주므로 내용만 담는다.
// 모달 셸은 기본적으로 showCloseButton 없는 비대칭 패딩을 쓰므로(확인 팝업 전제), 닫기 버튼과
// 대칭 패딩은 이 컴포넌트와 useNoteLink의 className 오버라이드로 직접 구현한다.
// Figma: 343×180(모바일) / 456×260(sm+) — useNoteLink가 모달 open 시 className으로 지정한다.
export default function NoteLinkInput({ initialUrl, onConfirm, onClose }: NoteLinkInputProps) {
  const t = useTranslations('note');
  const tc = useTranslations('common');
  const [value, setValue] = useState(initialUrl);

  // todo 생성 폼과 동일하게 프로토콜이 없으면 https://를 붙여 보정한 뒤 도메인 형태를 검증한다
  const trimmed = value.trim();
  const normalized = normalizeUrl(trimmed);
  const isValid = isValidLinkUrl(normalized);
  const showError = trimmed.length > 0 && !isValid;

  return (
    <>
      <Modal.Title className="text-left text-base sm:text-xl">{t('linkInput.title')}</Modal.Title>
      <input
        type="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('linkInput.placeholder')}
        aria-label={t('linkInput.label')}
        aria-invalid={showError || undefined}
        aria-describedby={showError ? 'link-input-error' : undefined}
        className={`dark:bg-indigo-dark-400 mt-6 w-full rounded border p-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:mt-8 sm:p-4 sm:text-base dark:text-white dark:placeholder:text-white/40 ${
          showError
            ? 'border-red-500'
            : 'dark:focus:border-indigo-dark-700 border-slate-300 focus:border-indigo-500 dark:border-white/20'
        }`}
      />
      <div className="mt-1 min-h-7 sm:min-h-8">
        {showError && (
          <p id="link-input-error" className="text-xs text-red-500 sm:text-sm">
            {t('linkInput.error')}
          </p>
        )}
      </div>
      <Modal.Actions>
        <Modal.Confirm className="h-10 sm:h-14" onClick={() => onConfirm(normalized)} disabled={!isValid}>
          {tc('actions.confirm')}
        </Modal.Confirm>
      </Modal.Actions>
      {/* DOM 마지막에 두어 열림 시 포커스가 콘텐츠로 먼저 가도록 한다(시각 위치는 absolute로 우상단 고정) */}
      <IconButton
        aria-label={tc('actions.close')}
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-8 sm:right-8"
      >
        <IcDelete aria-hidden="true" className="size-6 text-slate-400" />
      </IconButton>
    </>
  );
}
