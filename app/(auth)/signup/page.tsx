import SignupForm from '@/src/components/auth/SignupForm';
import SocialLoginSection from '@/src/components/auth/SocialLoginSection';
import { LogoFull } from '@/src/components/common/icons';

export default function Page() {
  return (
    <div className="flex w-full max-w-100 flex-col gap-10">
      {/* 로고 */}
      <LogoFull type="indigo" />

      {/* 폼 영역 */}
      <SignupForm />

      {/* 소셜 로그인 */}
      <SocialLoginSection />
    </div>
  );
}
