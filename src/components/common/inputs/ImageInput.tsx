'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { IcUpload } from '../icons';
import DeleteButton from '../buttons/DeleteButton';

interface ImageInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileChange?: (file: File | null) => void;
}

// file과 blob URL을 항상 함께 업데이트하므로 하나의 타입으로 묶는다
type FileWithUrl = { file: File; url: string };

export default function ImageInput({ onFileChange, ...props }: ImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // 이전 blob URL을 revokeObjectURL로 해제하기 위한 참조
  // 렌더를 유발할 필요가 없으므로 ref로 충분하다
  const prevUrlRef = useRef<string | null>(null);

  const [selected, setSelected] = useState<FileWithUrl | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.currentTarget.files?.[0];
    if (!selectedFile) return;

    // 파일이 교체될 때 이전 blob URL 즉시 해제해 메모리 누수를 방지한다
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);

    const url = URL.createObjectURL(selectedFile);
    prevUrlRef.current = url;

    setSelected({ file: selectedFile, url });
    setStatusMessage(`${selectedFile.name} 선택됨`);
    onFileChange?.(selectedFile);
  };

  const handleRemoveFile = () => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }

    setSelected(null);
    setStatusMessage('이미지가 삭제되었습니다');
    onFileChange?.(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  return (
    <>
      <span aria-live="polite" className="sr-only">
        {statusMessage}
      </span>
      {selected ? (
        <div className="relative h-25 w-40 overflow-hidden rounded-sm">
          <Image src={selected.url} alt={`선택된 이미지: ${selected.file.name}`} fill className="object-cover" />
          <span className="absolute top-2.5 right-2.5">
            <DeleteButton className="cursor-pointer" onClick={handleRemoveFile} />
          </span>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-y-0.5 rounded-sm border border-dashed border-slate-300 bg-slate-50 p-3 focus-within:border-indigo-500">
          <IcUpload />
          <span className="text-base font-medium text-slate-500">이미지 첨부</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            {...props}
          />
        </label>
      )}
    </>
  );
}
