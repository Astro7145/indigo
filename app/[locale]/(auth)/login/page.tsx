import { LogoFull } from '@/src/components/common/icons';
import LoginForm from '@/src/components/auth/LoginForm';
import SocialLoginSection from '@/src/components/auth/SocialLoginSection';

export default async function Page({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex w-full max-w-100 flex-col gap-10">
      {/* 로고 */}
      <LogoFull type="indigo" />

      {/* 폼 영역 */}
      <LoginForm callbackUrl={callbackUrl} />

      {/* 소셜 로그인 */}
      <SocialLoginSection />
    </div>
  );
}
