'use client';

import { useLogin } from '@/src/hooks/auth';
import { loginSchema } from '@/src/utils/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import Button from '../common/buttons/Button';
import Input from '../common/inputs/Input';
import PasswordInput from '../common/inputs/PasswordInput';
import { useRouter } from 'next/navigation';

type LoginFields = {
  email: string;
  password: string;
};

export default function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const t = useTranslations('login');
  const tc = useTranslations('common');
  const tv = useTranslations('validation');

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isSubmitted, errors, isValid },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema(tv)),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });
  const { mutate } = useLogin();

  const handleLoginBehavior = (data: LoginFields) => {
    const { email, password } = data;

    // 오픈 리다이렉트 방지: 내부 경로(/...)만 허용. //로 시작하는 프로토콜-상대 URL·절대 URL은 차단.
    const target = callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//') ? callbackUrl : '/';
    mutate({ email, password }, { onSuccess: () => router.push(target) });
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(handleLoginBehavior)}>
      {/* 입력 필드 */}
      <div className="flex flex-col gap-4">
        <span className="flex flex-col gap-y-1">
          <Input
            type="text"
            placeholder={tc('placeholders.email')}
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
            placeholder={tc('placeholders.password')}
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
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
        <div className="flex items-center justify-center gap-2 text-base tracking-[-0.03em]">
          <span className="font-medium text-slate-700">{t('signupPrompt')}</span>
          <Link href="/signup" className="font-semibold text-indigo-600">
            {t('signupLink')}
          </Link>
        </div>
      </div>
    </form>
  );
}
