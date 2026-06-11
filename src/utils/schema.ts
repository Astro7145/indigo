import z from 'zod';
import type { useTranslations } from 'next-intl';

// validation 네임스페이스 번역 함수. 스키마를 팩토리로 만들어 컴포넌트(useTranslations)에서
// 주입받아 검증 메시지를 i18n으로 처리한다. (zodResolver(loginSchema(t)) 형태로 사용)
type ValidationT = ReturnType<typeof useTranslations<'validation'>>;

export const todoCreateSchema = (t: ValidationT) =>
  z.object({
    title: z
      .string()
      .min(1, { error: t('titleRequired') })
      .max(30, { error: t('titleMax') }),
    goalId: z.number().optional(),
    dueDate: z.string().min(1, { error: t('dueDateRequired') }),
    linkUrl: z
      .string()
      .transform((val) => {
        if (!val) return val;
        if (/^https?:\/\//i.test(val)) return val;
        return `https://${val}`;
      })
      .pipe(z.union([z.url({ error: t('urlInvalid') }), z.literal('')]))
      .optional(),
  });

export type TodoCreateValues = z.infer<ReturnType<typeof todoCreateSchema>>;

export const loginSchema = (t: ValidationT) =>
  z.object({
    email: z.email({ error: t('emailInvalid') }),
    password: z.string().min(1, { error: t('passwordRequired') }),
  });

export const signupSchema = (t: ValidationT) =>
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

export const meSchema = (t: ValidationT) =>
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
