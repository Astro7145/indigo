'use client';

import { signIn } from 'next-auth/react';
import IconButton from '../common/buttons/IconButton';
import { IcGoogle, IcKakao } from '../common/icons';

export default function SocialLoginSection() {
  // 구글 소셜 로그인
  const loginWithGoogle = () => {
    signIn('google', { callbackUrl: '/api/oauth/google' });
  };

  // 카카오 소셜 로그인
  const loginWithKakao = () => {
    signIn('kakao', { callbackUrl: '/api/oauth/kakao' });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full items-center gap-2">
        <hr className="flex-1 border-slate-200" />
        <span className="text-sm whitespace-nowrap text-slate-400">SNS 계정으로 로그인</span>
        <hr className="flex-1 border-slate-200" />
      </div>
      <div className="flex items-center justify-center gap-4">
        <IconButton
          aria-label="구글로 로그인"
          hover={false}
          className="size-14 rounded-full border border-slate-200 bg-white hover:brightness-95"
          onClick={loginWithGoogle}
        >
          <IcGoogle />
        </IconButton>
        <IconButton
          aria-label="카카오로 로그인"
          hover={false}
          className="size-14 rounded-full bg-[#FFEE01] hover:brightness-95"
          onClick={loginWithKakao}
        >
          <IcKakao />
        </IconButton>
      </div>
    </div>
  );
}
