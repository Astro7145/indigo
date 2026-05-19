'use client'

import PasswordInput from '@/src/components/_common/inputs/PasswordInput'
import Input from '@/src/components/_common/inputs/Input'
import FileInput from '@/src/components/_common/inputs/FileInput'
import ImageInput from '@/src/components/_common/inputs/ImageInput'
import SearchInput from '@/src/components/_common/inputs/SearchInput'

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-y-4">
      <Input placeholder="이메일을 입력해주세요." />
      <PasswordInput placeholder="비밀번호를 입력해주세요." variant="default" />
      <FileInput />
      <ImageInput />
      <SearchInput onSearch={() => console.log('Searching...')} />
    </div>
  )
}
