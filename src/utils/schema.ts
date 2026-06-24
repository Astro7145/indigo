import type validationMessages from '@/messages/ko/validation.json';
import z from 'zod';

import { isValidLinkUrl, normalizeUrl } from './url';

// 다국어 메시지를 위해 t(validation 네임스페이스 번역 함수)를 받아 스키마를 생성한다.
type TodoValidationKey = 'titleRequired' | 'titleMax' | 'dueDateRequired' | 'urlInvalid';

export const createTodoCreateSchema = (t: (key: TodoValidationKey) => string) =>
  z.object({
    title: z
      .string()
      .min(1, { error: t('titleRequired') })
      .max(30, { error: t('titleMax') }),
    goalId: z.number().optional(),
    dueDate: z.string().min(1, { error: t('dueDateRequired') }),
    linkUrl: z
      .string()
      .transform(normalizeUrl)
      .refine((val) => val === '' || isValidLinkUrl(val), { error: t('urlInvalid') })
      .optional(),
  });

export type TodoCreateValues = z.infer<ReturnType<typeof createTodoCreateSchema>>;

// 검증 메시지를 i18n으로 전환하기 위해 translator(useTranslations('validation'))를 받아 스키마를 만든다.
// 컴포넌트는 useTranslations('validation')의 t를 주입해 선택된 언어로 에러 메시지를 표시한다.
// 키 타입은 next-intl 증강(src/i18n/global.d.ts)과 동일하게 ko validation.json을 SSOT로 좁힌다.
type Translator = (key: keyof typeof validationMessages) => string;

export const createLoginSchema = (t: Translator) =>
  z.object({
    email: z.email({ error: t('emailInvalid') }),
    password: z.string().min(1, { error: t('passwordRequired') }),
  });

export const createSignupSchema = (t: Translator) =>
  z
    .object({
      name: z
        .string()
        .min(1, { error: t('nameRequired') })
        .max(20, { error: t('nameMax') }),
      email: z.email({ error: t('emailInvalid') }),
      password: z.string().min(8, { error: t('passwordMin') }),
      passwordConfirm: z.string().min(1, { error: t('passwordConfirmRequired') }),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      path: ['passwordConfirm'],
      message: t('passwordMismatch'),
    });

// 다국어 메시지를 위해 t(validation 네임스페이스 번역 함수)를 받아 스키마를 생성한다.
type MeValidationKey =
  | 'nameRequired'
  | 'currentPasswordRequired'
  | 'passwordMin'
  | 'passwordConfirmRequired'
  | 'passwordMismatch'
  | 'passwordSameAsOld';

export const createMeSchema = (t: (key: MeValidationKey) => string) =>
  z
    .object({
      name: z.string().min(1, { error: t('nameRequired') }),
      currentPassword: z.string(),
      password: z.string(),
      passwordConfirm: z.string(),
    })
    .superRefine(({ currentPassword, password, passwordConfirm }, ctx) => {
      // 비밀번호 필드가 모두 비어있으면 비밀번호 미변경으로 보고 검증을 생략한다.
      if (currentPassword === '' && password === '' && passwordConfirm === '') return;

      // 하나라도 입력되면 비밀번호 변경으로 보고 전체 규칙을 검증한다.
      if (currentPassword === '') {
        ctx.addIssue({ code: 'custom', path: ['currentPassword'], message: t('currentPasswordRequired') });
      }
      if (password.length < 8) {
        ctx.addIssue({ code: 'custom', path: ['password'], message: t('passwordMin') });
      }
      if (passwordConfirm === '') {
        ctx.addIssue({ code: 'custom', path: ['passwordConfirm'], message: t('passwordConfirmRequired') });
      } else if (password !== passwordConfirm) {
        ctx.addIssue({ code: 'custom', path: ['passwordConfirm'], message: t('passwordMismatch') });
      }
      if (currentPassword !== '' && currentPassword === password) {
        ctx.addIssue({ code: 'custom', path: ['password'], message: t('passwordSameAsOld') });
      }
    });
