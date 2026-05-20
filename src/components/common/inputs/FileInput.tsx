'use client'

import { cn } from '@/src/utils/cn'
import { cva } from 'class-variance-authority'
import { useRef, useState } from 'react'
import { IcDelete, IcUpload } from '../icons'

const inputContainerVariants = cva(
  'flex items-center gap-x-2 rounded-sm border bg-white focus-within:outline-indigo-500 p-3 sm:p-4 focus-within:outline-2',
  {
    variants: {
      variant: {
        default: 'border-slate-300',
        error: 'border-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const textVariants = cva('text-sm font-normal outline-none sm:text-base', {
  variants: {
    selected: {
      false: 'text-slate-500',
      true: 'text-slate-700',
    },
  },
})

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error'
  onFileChange?: (file: File | null) => void
}

export default function FileInput({
  variant,
  onFileChange,
  ...props
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [statusMessage, setStatusMessage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.currentTarget.files?.[0]
    // 파일 탐색기 취소 시 일부 브라우저가 빈 FileList로 change 이벤트를 발생시킴
    // 이 경우 기존 선택 파일을 유지하기 위해 early return
    if (!selectedFile) return
    setFile(selectedFile)
    setStatusMessage(`${selectedFile.name} 선택됨`)
    onFileChange?.(selectedFile)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setStatusMessage('파일이 삭제되었습니다')
    onFileChange?.(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <label className={cn(inputContainerVariants({ variant }))}>
      <span aria-live="polite" className="sr-only">
        {statusMessage}
      </span>
      <IcUpload />
      <span className={cn(textVariants({ selected: !!file }))}>
        {file ? file.name : '파일을 선택해주세요'}
      </span>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        onChange={handleFileChange}
        {...props}
      />
      {file && (
        <button
          aria-label="파일 삭제"
          onClick={handleRemoveFile}
          className="cursor-pointer"
        >
          <IcDelete />
        </button>
      )}
    </label>
  )
}
