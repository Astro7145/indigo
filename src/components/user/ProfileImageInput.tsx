'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { IcPencil } from '@/src/components/common/icons/IcPencil';

export default function ProfileImageInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  // 이전 blob URL을 revokeObjectURL로 해제하기 위한 참조
  const prevUrlRef = useRef<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);

    const url = URL.createObjectURL(file);
    prevUrlRef.current = url;
    setImageUrl(url);
    setStatusMessage(`${file.name} 선택됨`);

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

      {imageUrl ? (
        <Image src={imageUrl} alt="프로필 사진" fill className="rounded-full object-cover" />
      ) : (
        <div role="img" aria-label="프로필 사진" className="size-full rounded-full bg-indigo-600" />
      )}

      <button
        type="button"
        aria-label="프로필 사진 변경"
        onClick={() => inputRef.current?.click()}
        className="absolute right-0 bottom-0 flex size-9 cursor-pointer items-center justify-center rounded-full bg-indigo-500 transition-colors hover:bg-indigo-600"
      >
        <IcPencil className="size-5 text-white" />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label="프로필 사진 파일 선택"
        className="sr-only"
        onChange={handleChange}
      />
    </div>
  );
}
