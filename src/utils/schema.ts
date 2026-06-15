import z from 'zod';

export const todoCreateSchema = z.object({
  title: z.string().min(1, { error: '제목을 입력해주세요.' }).max(30, { error: '제목은 30자 이하로 입력해주세요.' }),
  goalId: z.number().optional(),
  dueDate: z.string().min(1, { error: '마감일을 선택해주세요.' }),
  linkUrl: z
    .string()
    .transform((val) => {
      if (!val) return val;
      if (/^https?:\/\//i.test(val)) return val;
      return `https://${val}`;
    })
    .pipe(z.union([z.url({ error: '올바른 URL을 입력해주세요.' }), z.literal('')]))
    .optional(),
});

export type TodoCreateValues = z.infer<typeof todoCreateSchema>;

// 검증 메시지를 i18n으로 전환하기 위해 translator(useTranslations('validation'))를 받아 스키마를 만든다.
// 컴포넌트는 useTranslations('validation')의 t를 주입해 선택된 언어로 에러 메시지를 표시한다.
type Translator = (key: string) => string;

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

export const meSchema = z
  .object({
    name: z.string().min(1, { error: '이름을 입력해주세요.' }),
    currentPassword: z.string(),
    password: z.string(),
    passwordConfirm: z.string(),
  })
  .superRefine(({ currentPassword, password, passwordConfirm }, ctx) => {
    // 비밀번호 필드가 모두 비어있으면 비밀번호 미변경으로 보고 검증을 생략한다.
    if (currentPassword === '' && password === '' && passwordConfirm === '') return;

    // 하나라도 입력되면 비밀번호 변경으로 보고 전체 규칙을 검증한다.
    if (currentPassword === '') {
      ctx.addIssue({ code: 'custom', path: ['currentPassword'], message: '현재 비밀번호를 입력해주세요.' });
    }
    if (password.length < 8) {
      ctx.addIssue({ code: 'custom', path: ['password'], message: '비밀번호가 8자 이상이 되도록 해 주세요.' });
    }
    if (passwordConfirm === '') {
      ctx.addIssue({ code: 'custom', path: ['passwordConfirm'], message: '비밀번호 확인을 입력해주세요.' });
    } else if (password !== passwordConfirm) {
      ctx.addIssue({ code: 'custom', path: ['passwordConfirm'], message: '비밀번호가 일치하지 않습니다.' });
    }
    if (currentPassword !== '' && currentPassword === password) {
      ctx.addIssue({ code: 'custom', path: ['password'], message: '기존과 다른 비밀번호를 입력해주세요.' });
    }
  });
