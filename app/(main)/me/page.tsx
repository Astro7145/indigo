import type { Metadata } from 'next';
import Button from '@/src/components/common/buttons/Button';
import { IcPencil } from '@/src/components/common/icons/IcPencil';
import Input from '@/src/components/common/inputs/Input';
import PasswordInput from '@/src/components/common/inputs/PasswordInput';

export const metadata: Metadata = {
  title: '내 정보 관리 | INdigo',
  description: '프로필 사진, 이름, 비밀번호를 변경할 수 있습니다.',
};

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-140 flex-col gap-10">
      {/* 모바일은 Topbar가 타이틀을 담당하므로 sm+에서만 노출 */}
      <h1 className="hidden pl-2 text-2xl font-semibold text-slate-800 sm:block">내 정보 관리</h1>

      <section
        aria-label="내 정보 관리 폼"
        className="flex flex-col items-center gap-12 rounded-lg border border-slate-200 bg-white px-5 py-10 shadow-[0_2px_4px_rgba(0,0,0,0.04)] sm:px-8"
      >
        {/* 프로필 이미지 */}
        <div className="relative size-33">
          {/* 실제 이미지가 없으므로 indigo-600으로 대체 */}
          <div role="img" aria-label="프로필 사진" className="size-full rounded-full bg-indigo-600" />
          <button
            type="button"
            aria-label="프로필 사진 변경"
            className="absolute right-0 bottom-0 flex size-9 cursor-pointer items-center justify-center rounded-full bg-indigo-500 transition-colors hover:bg-indigo-600"
          >
            <IcPencil className="size-5 text-white" />
          </button>
        </div>

        {/* 정보 수정 폼 */}
        <form className="flex w-full flex-col gap-12">
          <div className="flex flex-col gap-10">
            {/* 기본 정보: 이메일 · 이름 */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="pl-1 text-base font-semibold text-slate-700">
                  이메일
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue="codeit@email.com"
                  disabled
                  className="cursor-not-allowed bg-slate-50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="pl-1 text-base font-semibold text-slate-700">
                  이름
                </label>
                <Input id="name" name="name" type="text" placeholder="이름을 입력해주세요" defaultValue="체다치즈" />
              </div>
            </div>

            {/* 비밀번호 변경 */}
            <fieldset className="flex flex-col gap-2">
              <legend className="pl-1 text-base font-semibold text-slate-700">비밀번호 변경</legend>
              <div className="flex flex-col gap-3">
                <PasswordInput
                  id="currentPassword"
                  name="currentPassword"
                  placeholder="현재 비밀번호를 입력해주세요"
                  aria-label="현재 비밀번호"
                  autoComplete="current-password"
                />
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  placeholder="새 비밀번호를 입력해주세요"
                  aria-label="새 비밀번호"
                  autoComplete="new-password"
                />
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="새 비밀번호를 다시 입력해주세요"
                  aria-label="새 비밀번호 확인"
                  autoComplete="new-password"
                />
              </div>
            </fieldset>
          </div>

          <Button type="submit" className="h-12 w-full text-base sm:h-14 sm:text-lg">
            저장하기
          </Button>
        </form>
      </section>
    </div>
  );
}
