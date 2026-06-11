'use client';

import { useSignup } from '@/src/hooks/auth';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useCheckNickname } from '@/src/hooks/user';
import { signupSchema } from '@/src/utils/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { type ReactNode } from 'react';
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
  const t = useTranslations('signup');
  const tc = useTranslations('common');
  const tv = useTranslations('validation');

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, isSubmitted, errors, isValid },
  } = useForm<SignupFields>({
    resolver: zodResolver(signupSchema(tv)),
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

  // React-Hook-Form errors와 무관하게 표시(nameError)·submit 차단(nicknameTaken)한다.
  const nicknameTaken = nicknameCheck?.available === false;
  const nameError: FieldError | undefined =
    errors.name ?? (nicknameTaken ? { type: 'manual', message: t('nicknameTaken') } : undefined);

  const handleSignupBehavior = (data: SignupFields) => {
    const { email, name, password } = data;

    mutate(
      { email, name, password },
      {
        onSuccess: () => {
          alert(t('completeAlert'));
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
        <InputSection label={tc('fields.name')} htmlFor="name" error={nameError}>
          <Input
            id="name"
            type="text"
            placeholder={tc('placeholders.name')}
            className="w-full"
            variant={nameError ? 'error' : 'default'}
            aria-invalid={isSubmitted ? (nameError ? 'true' : 'false') : undefined}
            {...register('name')}
          />
        </InputSection>

        {/* 이메일 */}
        <InputSection label={tc('fields.email')} htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="text"
            placeholder={tc('placeholders.email')}
            className="w-full"
            variant={errors.email ? 'error' : 'default'}
            aria-invalid={isSubmitted ? (errors.email ? 'true' : 'false') : undefined}
            {...register('email')}
          />
        </InputSection>

        {/* 패스워드 */}
        <InputSection label={tc('fields.password')} htmlFor="password" error={errors.password}>
          <PasswordInput
            id="password"
            placeholder={tc('placeholders.password')}
            className="w-full"
            variant={errors.password ? 'error' : 'default'}
            aria-invalid={isSubmitted ? (errors.password ? 'true' : 'false') : undefined}
            {...register('password')}
          />
        </InputSection>

        {/* 패스워드 확인 */}
        <InputSection label={t('passwordConfirmLabel')} htmlFor="passwordConfirm" error={errors.passwordConfirm}>
          <PasswordInput
            id="passwordConfirm"
            placeholder={t('passwordConfirmPlaceholder')}
            className="w-full"
            variant={errors.passwordConfirm ? 'error' : 'default'}
            aria-invalid={isSubmitted ? (errors.passwordConfirm ? 'true' : 'false') : undefined}
            {...register('passwordConfirm')}
          />
        </InputSection>
      </div>

      {/* 로그인 버튼 & 회원가입 링크 */}
      <div className="flex flex-col gap-6">
        <Button type="submit" className="w-full" disabled={isSubmitting || !isValid || nicknameTaken}>
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
        <div className="flex items-center justify-center gap-2 text-base tracking-[-0.03em]">
          <span className="font-medium text-slate-700">{t('loginPrompt')}</span>
          <Link href="/login" className="font-semibold text-indigo-600">
            {t('loginLink')}
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
