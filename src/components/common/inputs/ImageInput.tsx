'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { IcDelete, IcUpload } from '../icons'

interface ImageInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileChange?: (file: File | null) => void
}

export default function ImageInput({ onFileChange }: ImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.currentTarget.files?.[0] || null
    setFile(selectedFile)
    onFileChange?.(selectedFile)
  }

  const handleRemoveFile = () => {
    setFile(null)
    onFileChange?.(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  if (file) {
    return (
      <div className="relative h-25 w-100 overflow-hidden rounded-sm">
        <Image
          src={URL.createObjectURL(file)}
          alt="Selected Image"
          layout="fill"
          objectFit="cover"
        />
        <button
          onClick={handleRemoveFile}
          className="absolute top-2.5 right-2.5 cursor-pointer rounded-full border border-slate-300 bg-white"
        >
          <IcDelete />
        </button>
      </div>
    )
  }

  return (
    <label>
      <div className="flex flex-col items-center justify-center gap-y-0.5 rounded-sm border-2 border-dashed border-slate-300 p-3">
        <IcUpload />
        <span className="text-base font-medium text-slate-500">
          이미지 첨부
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </label>
  )
}
