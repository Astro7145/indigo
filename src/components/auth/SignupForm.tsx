'use client';

import { useSignup } from '@/src/hooks/auth';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useCheckNickname } from '@/src/hooks/user';
import { signupSchema } from '@/src/utils/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { useForm, useWatch, type FieldError } from 'react-hook-form';
import Button from '../common/buttons/Button';
import Input from '../common/inputs/Input';
import PasswordInput from '../common/inputs/PasswordInput';
import { useRouter } from 'next/navigation';

type SignupFields = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

export default function SignupForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { isSubmitting, isSubmitted, errors, isValid },
  } = useForm<SignupFields>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
    mode: 'onBlur',
  });

  const { mutate } = useSignup();

  const { name } = useWatch({ control });
  const debouncedName = useDebounce(name ?? '');
  const { data: nicknameCheck } = useCheckNickname(debouncedName);

  useEffect(() => {
    if (!nicknameCheck) return;
    if (!nicknameCheck.available) {
      setError('name', { type: 'manual', message: '이미 사용 중인 닉네임입니다.' });
    } else {
      clearErrors('name');
    }
  }, [nicknameCheck, setError, clearErrors]);

  const handleSignupBehavior = (data: SignupFields) => {
    const { email, name, password } = data;

    mutate(
      { email, name, password },
      {
        onSuccess: () => {
          alert('회원가입이 완료되었습니다.');
          router.push('/');
        },
      },
    );
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(handleSignupBehavior)}>
      {/* 입력 필드 */}
      <div className="flex flex-col gap-4">
        {/* 이름 */}
        <InputSection label="이름" htmlFor="name" error={errors.name}>
          <Input
            id="name"
            type="text"
            placeholder="이름을 입력해주세요"
            className="w-full"
            variant={errors.name ? 'error' : 'default'}
            aria-invalid={isSubmitted ? (errors.name ? 'true' : 'false') : undefined}
            {...register('name')}
          />
        </InputSection>

        {/* 이메일 */}
        <InputSection label="이메일" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="text"
            placeholder="이메일을 입력해주세요"
            className="w-full"
            variant={errors.email ? 'error' : 'default'}
            aria-invalid={isSubmitted ? (errors.email ? 'true' : 'false') : undefined}
            {...register('email')}
          />
        </InputSection>

        {/* 패스워드 */}
        <InputSection label="비밀번호" htmlFor="password" error={errors.password}>
          <PasswordInput
            id="password"
            placeholder="비밀번호를 입력해주세요"
            className="w-full"
            variant={errors.password ? 'error' : 'default'}
            aria-invalid={isSubmitted ? (errors.password ? 'true' : 'false') : undefined}
            {...register('password')}
          />
        </InputSection>

        {/* 패스워드 확인 */}
        <InputSection label="비밀번호 확인" htmlFor="passwordConfirm" error={errors.passwordConfirm}>
          <PasswordInput
            id="passwordConfirm"
            placeholder="비밀번호를 다시 입력해주세요"
            className="w-full"
            variant={errors.passwordConfirm ? 'error' : 'default'}
            aria-invalid={isSubmitted ? (errors.passwordConfirm ? 'true' : 'false') : undefined}
            {...register('passwordConfirm')}
          />
        </InputSection>
      </div>

      {/* 로그인 버튼 & 회원가입 링크 */}
      <div className="flex flex-col gap-6">
        <Button type="submit" className="w-full" disabled={isSubmitting || !isValid}>
          {isSubmitting ? '처리중...' : '회원가입 하기'}
        </Button>
        <div className="flex items-center justify-center gap-2 text-base tracking-[-0.03em]">
          <span className="font-medium text-slate-700">이미 회원이신가요?</span>
          <Link href="/login" className="font-semibold text-indigo-600">
            로그인
          </Link>
        </div>
      </div>
    </form>
  );
}

interface InputSectionProps {
  label?: string;
  htmlFor?: string;
  error?: FieldError;
  children: ReactNode;
}

function InputSection({ label, htmlFor, error, children }: InputSectionProps) {
  return (
    <span className="flex flex-col gap-y-2">
      {label && (
        <label htmlFor={htmlFor} className="text-base font-semibold text-slate-700">
          {label}
        </label>
      )}
      {children}
      {error && (
        <small className="text-destructive text-sm font-medium" role="alert">
          {error.message}
        </small>
      )}
    </span>
  );
}
