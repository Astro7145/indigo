'use client';

import Link from 'next/link';

import IconButton from '@/src/components/common/buttons/IconButton';
import Button from '@/src/components/common/buttons/Button';
import { IcGoogle } from '@/src/components/common/icons/IcGoogle';
import { IcKakao } from '@/src/components/common/icons/IcKakao';
import Input from '@/src/components/common/inputs/Input';
import PasswordInput from '@/src/components/common/inputs/PasswordInput';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/src/utils/schema';
import { LogoFull } from '@/src/components/common/icons';
import { useLogin } from '@/src/hooks/auth';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, isSubmitted, errors, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: undefined,
      password: undefined,
    },
    mode: 'onBlur',
  });
  const { email, password } = useWatch({ control });

  const { mutate } = useLogin();

  const handleLoginBehavior = () => {
    if (!email || !password) return;

    mutate({ email, password });
  };

  // 구글 소셜 로그인
  const loginWithGoogle = () => {
    signIn('google', { callbackUrl: '/api/oauth/google' });
  };

  // 구글 소셜 로그인
  const loginWithKakao = () => {
    signIn('kakao', { callbackUrl: '/api/oauth/kakao' });
  };

  return (
    <div className="flex w-full max-w-100 flex-col gap-10">
      {/* 로고 */}
      <LogoFull type="indigo" />

      {/* 폼 영역 */}
      <form className="flex flex-col gap-8" onSubmit={handleSubmit(handleLoginBehavior)}>
        {/* 입력 필드 */}
        <div className="flex flex-col gap-4">
          <span className="flex flex-col gap-y-1">
            <Input
              type="text"
              placeholder="이메일을 입력해주세요"
              className="w-full"
              variant={errors.email ? 'error' : 'default'}
              aria-invalid={isSubmitted ? (errors.email ? 'true' : 'false') : undefined}
              {...register('email')}
            />
            {errors.email && (
              <small className="text-destructive text-sm font-medium" role="alert">
                {errors.email.message}
              </small>
            )}
          </span>
          <span className="flex flex-col gap-y-1">
            <PasswordInput
              placeholder="비밀번호를 입력해주세요"
              className="w-full"
              variant={errors.password ? 'error' : 'default'}
              aria-invalid={isSubmitted ? (errors.password ? 'true' : 'false') : undefined}
              {...register('password')}
            />
            {errors.password && (
              <small className="text-destructive text-sm font-medium" role="alert">
                {errors.password.message}
              </small>
            )}
          </span>
        </div>

        {/* 로그인 버튼 & 회원가입 링크 */}
        <div className="flex flex-col gap-6">
          <Button type="submit" className="w-full" disabled={isSubmitting || !isValid}>
            {isSubmitting ? '로그인중...' : '로그인하기'}
          </Button>
          <div className="flex items-center justify-center gap-2 text-base tracking-[-0.03em]">
            <span className="font-medium text-slate-700">INdigo가 처음이신가요?</span>
            <Link href="/signup" className="font-semibold text-indigo-600">
              회원가입
            </Link>
          </div>
        </div>
      </form>

      {/* 소셜 로그인 */}
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
    </div>
  );
}
