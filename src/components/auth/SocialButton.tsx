import { IcGoogle } from '@/src/components/common/icons/IcGoogle'
import { IcKakao } from '@/src/components/common/icons/IcKakao'
import { cn } from '@/src/utils/cn'

/** 소셜 로그인 제공자 */
export type SocialProvider = 'google' | 'kakao'

interface SocialButtonProps {
  provider: SocialProvider
  onClick: () => void
  className?: string
}

/**
 * provider별 배경·테두리 클래스
 * Kakao yellow(#FFEE01)는 브랜드 색상으로 디자인 토큰 미등록
 */
const providerStyles: Record<SocialProvider, string> = {
  google: 'bg-white border border-slate-200',
  kakao: 'bg-[#FFEE01]',
}

/**
 * 회원가입·로그인 하단 소셜 로그인 버튼. 크기 고정(56px)
 *
 * @param provider  소셜 로그인 제공자. `"google"` | `"kakao"`
 * @param onClick   로그인/회원가입 핸들러
 * @param className 추가 Tailwind 클래스
 *
 * @example
 * <div className="flex gap-4">
 *   <SocialButton provider="google" onClick={handleGoogleLogin} />
 *   <SocialButton provider="kakao" onClick={handleKakaoLogin} />
 * </div>
 */
export default function SocialButton({ provider, onClick, className }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${provider} 로그인`}
      className={cn(
        'flex size-[56px] cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-80',
        providerStyles[provider],
        className,
      )}
    >
      {provider === 'google' && <IcGoogle />}
      {provider === 'kakao' && <IcKakao />}
    </button>
  )
}
