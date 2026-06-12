import type { Metadata } from 'next';
import ProfileImageInput from '@/src/components/user/ProfileImageInput';
import ProfileForm from '@/src/components/user/ProfileForm';

export const metadata: Metadata = {
  title: '내 정보 관리 | INdigo',
  description: '프로필 사진, 이름, 비밀번호를 변경할 수 있습니다.',
};

export default function Page() {
  return (
    <>
      <div className="mx-auto flex w-full max-w-140 flex-col gap-10">
        {/* 모바일은 Topbar가 타이틀을 담당하므로 sm+에서만 노출 */}
        <h1 className="hidden pl-2 text-2xl font-semibold text-slate-800 sm:block">내 정보 관리</h1>

        <section
          aria-label="내 정보 관리 폼"
          className="flex flex-col items-center gap-12 rounded-lg border border-slate-200 bg-white px-5 py-10 shadow-[0_2px_4px_rgba(0,0,0,0.04)] sm:px-8"
        >
          <ProfileImageInput />

          {/* 정보 수정 폼 */}
          <ProfileForm />
        </section>
      </div>
    </>
  );
}
