'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import Button from '@/src/components/common/buttons/Button';
import Input from '@/src/components/common/inputs/Input';
import PasswordInput from '@/src/components/common/inputs/PasswordInput';
import { useToast } from '@/src/hooks/useToast';
import { useCreateImageUploadUrl, useUploadImageToS3 } from '@/src/hooks/upload';
import { useChangePassword, useMe, useUpdateMe } from '@/src/hooks/user';
import { useProfileImageStore } from '@/src/stores/profileImage';
import { ApiError } from '@/src/types/common';
import { meSchema } from '@/src/utils/schema';

type MeFields = z.infer<ReturnType<typeof meSchema>>;

export default function ProfileForm() {
  const t = useTranslations('me');
  const tc = useTranslations('common');
  const tv = useTranslations('validation');

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isSubmitted, errors, isValid, isDirty },
  } = useForm<MeFields>({
    resolver: zodResolver(meSchema(tv)),
    defaultValues: {
      name: '',
      currentPassword: '',
      password: '',
      passwordConfirm: '',
    },
    mode: 'onBlur',
  });

  const { data: me, isLoading } = useMe();

  // 서버에서 내 정보를 불러오면 이름 필드를 채운다 (비밀번호 필드는 빈 값 유지).
  useEffect(() => {
    if (me && !isDirty) {
      reset({ name: me.name, currentPassword: '', password: '', passwordConfirm: '' });
    }
  }, [me, reset, isDirty]);

  const { mutateAsync: createImageUploadUrl } = useCreateImageUploadUrl();
  const { mutateAsync: uploadImage } = useUploadImageToS3();
  const { mutateAsync: updateMe } = useUpdateMe();
  const { mutateAsync: changePassword } = useChangePassword();
  const { showToast } = useToast();
  const file = useProfileImageStore((s) => s.file);
  const resetProfileImage = useProfileImageStore((s) => s.reset);

  const onSubmit = async (data: MeFields) => {
    try {
      // 새 이미지가 선택된 경우에만 업로드 URL을 발급받아 S3에 업로드하고, 최종 url을 받는다.
      let image: string | undefined;
      if (file) {
        const { uploadUrl, url } = await createImageUploadUrl({ fileName: file.name });
        await uploadImage({ uploadUrl, file });
        resetProfileImage();
        image = url;
      }

      // 프로필(이름·이미지) 업데이트. 새 이미지가 없으면 image는 보내지 않는다.
      await updateMe({ name: data.name, ...(image ? { image } : {}) });

      // 비밀번호를 입력한 경우에만 비밀번호를 변경한다 (미입력 시 변경하지 않음).
      if (data.password) {
        try {
          await changePassword({ currentPassword: data.currentPassword, newPassword: data.password });
        } catch (error) {
          // 401: 현재 비밀번호 불일치 → 인라인 토스트로 안내하고 종료한다.
          if (error instanceof ApiError && error.code === 'INVALID_CREDENTIALS') {
            showToast(t('password.mismatch'), 'error');
            return;
          }
          throw error;
        }
      }

      showToast(tc('toast.saved'));
    } catch {
      showToast(tc('toast.saveError'), 'error');
    }
  };

  return (
    <form className="flex w-full flex-col gap-12" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-10">
        {/* 기본 정보: 이메일 · 이름 */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="pl-1 text-base font-semibold text-slate-700">
              {tc('fields.email')}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={isLoading ? '' : (me?.email ?? '')}
              placeholder={isLoading ? 'Loading...' : undefined}
              disabled
              className="cursor-not-allowed bg-slate-50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="pl-1 text-base font-semibold text-slate-700">
              {tc('fields.name')}
            </label>
            <Input
              id="name"
              type="text"
              placeholder={isLoading ? 'Loading...' : tc('placeholders.name')}
              disabled={isLoading}
              variant={errors.name ? 'error' : 'default'}
              aria-invalid={isSubmitted ? (errors.name ? 'true' : 'false') : undefined}
              {...register('name')}
            />
            {errors.name && (
              <small className="text-destructive pl-1 text-sm font-medium" role="alert">
                {errors.name.message}
              </small>
            )}
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <fieldset>
          <legend className="mb-2 pl-1 text-base font-semibold text-slate-700">{t('password.section')}</legend>
          <div className="flex flex-col gap-3">
            <PasswordInput
              id="currentPassword"
              placeholder={t('password.currentPlaceholder')}
              aria-label={t('password.currentLabel')}
              autoComplete="current-password"
              {...register('currentPassword')}
            />
            <div className="flex flex-col gap-2">
              <PasswordInput
                id="newPassword"
                placeholder={t('password.newPlaceholder')}
                aria-label={t('password.newLabel')}
                autoComplete="new-password"
                variant={errors.password ? 'error' : 'default'}
                aria-invalid={isSubmitted ? (errors.password ? 'true' : 'false') : undefined}
                {...register('password')}
              />
              {errors.password && (
                <small className="text-destructive pl-1 text-sm font-medium" role="alert">
                  {errors.password.message}
                </small>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <PasswordInput
                id="confirmPassword"
                placeholder={t('password.confirmPlaceholder')}
                aria-label={t('password.confirmLabel')}
                autoComplete="new-password"
                variant={errors.passwordConfirm ? 'error' : 'default'}
                aria-invalid={isSubmitted ? (errors.passwordConfirm ? 'true' : 'false') : undefined}
                {...register('passwordConfirm')}
              />
              {errors.passwordConfirm && (
                <small className="text-destructive pl-1 text-sm font-medium" role="alert">
                  {errors.passwordConfirm.message}
                </small>
              )}
            </div>
          </div>
        </fieldset>
      </div>

      <Button type="submit" disabled={isSubmitting || !isValid} className="h-12 w-full text-base sm:h-14 sm:text-lg">
        {tc('actions.save')}
      </Button>
    </form>
  );
}
