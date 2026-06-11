import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ProfileImageInput from '@/src/components/user/ProfileImageInput';
import ProfileForm from '@/src/components/user/ProfileForm';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('me');
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function Page() {
  const t = await getTranslations('me');

  return (
    <>
      <div className="mx-auto flex w-full max-w-140 flex-col gap-10">
        {/* 모바일은 Topbar가 타이틀을 담당하므로 sm+에서만 노출 */}
        <h1 className="hidden pl-2 text-2xl font-semibold text-slate-800 sm:block">{t('title')}</h1>

        <section
          aria-label={t('formLabel')}
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
