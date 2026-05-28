'use client';

import { useLogin } from '@/src/hooks/auth';
import { loginSchema } from '@/src/utils/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import Button from '../common/buttons/Button';
import Input from '../common/inputs/Input';
import PasswordInput from '../common/inputs/PasswordInput';

type LoginFields = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isSubmitted, errors, isValid },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: undefined,
      password: undefined,
    },
    mode: 'onBlur',
  });
  const { mutate } = useLogin();

  const handleLoginBehavior = (data: LoginFields) => {
    const { email, password } = data;

    mutate({ email, password });
  };

  return (
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
  );
}
