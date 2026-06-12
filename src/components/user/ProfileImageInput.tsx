'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { IcPencil } from '@/src/components/common/icons/IcPencil';
import { useToast } from '@/src/hooks/useToast';
import { useMe } from '@/src/hooks/user';
import { useProfileImageStore } from '@/src/stores/profileImage';

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

export default function ProfileImageInput() {
  const tCommon = useTranslations('common');
  const tMe = useTranslations('me');
  const inputRef = useRef<HTMLInputElement>(null);
  // 이전 blob URL을 revokeObjectURL로 해제하기 위한 참조
  const prevUrlRef = useRef<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const setFile = useProfileImageStore((s) => s.setFile);
  const { showToast } = useToast();
  const { data: me } = useMe();

  // 로컬에서 새로 선택한 미리보기가 있으면 우선하고, 없으면 서버의 기존 프로필 이미지를 보여준다.
  const displayUrl = imageUrl ?? me?.image ?? null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    // 허용된 이미지 확장자만 받는다 (accept는 우회 가능하므로 직접 검증).
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      showToast(tMe('image.unsupported'), 'error');
      e.currentTarget.value = '';
      return;
    }

    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);

    const url = URL.createObjectURL(file);
    prevUrlRef.current = url;
    setImageUrl(url);
    setStatusMessage(tCommon('file.selected', { fileName: file.name }));

    // 선택한 파일을 스토어에 저장만 한다.
    // 업로드 URL 발급·S3 업로드는 ProfileForm 제출 시점에 함께 수행한다.
    setFile(file);

    // 같은 파일을 다시 선택할 수 있도록 value 초기화
    e.currentTarget.value = '';
  };

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  return (
    <div className="relative size-33">
      <span aria-live="polite" className="sr-only">
        {statusMessage}
      </span>

      {displayUrl ? (
        <Image src={displayUrl} alt={tMe('image.alt')} fill className="rounded-full object-cover" />
      ) : (
        <div role="img" aria-label={tMe('image.alt')} className="size-full rounded-full bg-indigo-600" />
      )}

      <button
        type="button"
        aria-label={tMe('image.change')}
        onClick={() => inputRef.current?.click()}
        className="absolute right-0 bottom-0 flex size-9 cursor-pointer items-center justify-center rounded-full border border-white bg-indigo-500 transition-colors hover:bg-indigo-600"
      >
        <IcPencil className="size-5 text-white" />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
        aria-label={tMe('image.select')}
        className="sr-only"
        onChange={handleChange}
      />
    </div>
  );
}
