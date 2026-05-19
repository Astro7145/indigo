import { cn } from '@/src/utils/cn'

// TODO: icons 공통 머지 후 주석 해제
// import { IcGoogle } from '@/src/components/_common/icons/IcGoogle'
// import { IcKakao } from '@/src/components/_common/icons/IcKakao'

/** 소셜 로그인 제공자 */
export type SocialProvider = 'google' | 'kakao'

/**
 * SocialButton 컴포넌트 props
 *
 * @param provider  소셜 로그인 제공자. `"google"` | `"kakao"`
 * @param onClick   로그인/회원가입 핸들러
 * @param className 추가 Tailwind 클래스
 *
 * @example
 * // 회원가입·로그인 하단 소셜 버튼 목록
 * <div className="flex gap-4">
 *   <SocialButton provider="google" onClick={handleGoogleLogin} />
 *   <SocialButton provider="kakao" onClick={handleKakaoLogin} />
 * </div>
 */
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

/** 회원가입·로그인 하단 소셜 로그인 버튼. 크기 고정(56px) */
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
      {/* TODO: icons 공통 머지 후 아래 주석 해제 */}
      {/* {provider === 'google' && <IcGoogle className="size-6" />} */}
      {/* {provider === 'kakao' && <IcKakao className="size-6" />} */}
    </button>
  )
}
