'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { IcUpload } from '../icons'
import DeleteButton from '../buttons/DeleteButton'

interface ImageInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileChange?: (file: File | null) => void
}

export default function ImageInput({ onFileChange }: ImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [statusMessage, setStatusMessage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.currentTarget.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setStatusMessage(`${selectedFile.name} 선택됨`)
    onFileChange?.(selectedFile)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setStatusMessage('이미지가 삭제되었습니다')
    onFileChange?.(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <>
      <span aria-live="polite" className="sr-only">
        {statusMessage}
      </span>
      {file ? (
        <div className="relative h-25 w-100 overflow-hidden rounded-sm">
          <Image
            src={URL.createObjectURL(file)}
            alt={`선택된 이미지: ${file.name}`}
            fill
            className="object-cover"
          />
          <span className="absolute top-2.5 right-2.5">
            <DeleteButton className="cursor-pointer" onClick={handleRemoveFile} />
          </span>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-y-0.5 rounded-sm border-2 border-dashed border-slate-300 p-3 focus-within:outline-2">
          <IcUpload />
          <span className="text-base font-medium text-slate-500">
            이미지 첨부
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      )}
    </>
  )
}
