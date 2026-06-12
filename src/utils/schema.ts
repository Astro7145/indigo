import z from 'zod';

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
      .transform((val) => {
        if (!val) return val;
        if (/^https?:\/\//i.test(val)) return val;
        return `https://${val}`;
      })
      .pipe(z.union([z.url({ error: t('urlInvalid') }), z.literal('')]))
      .optional(),
  });

export type TodoCreateValues = z.infer<ReturnType<typeof createTodoCreateSchema>>;

export const loginSchema = z.object({
  email: z.email({ error: '올바른 이메일을 입력해주세요.' }),
  password: z.string().min(1, { error: '비밀번호는 필수 입력입니다.' }),
});

export const signupSchema = z
  .object({
    name: z.string().min(1, { error: '이름을 입력해주세요.' }).max(20, { error: '이름은 20자 이하로 입력해주세요.' }),
    email: z.email({ error: '올바른 이메일을 입력해주세요.' }),
    password: z.string().min(8, { error: '비밀번호가 8자 이상이 되도록 해 주세요.' }),
    passwordConfirm: z.string().min(1, { error: '비밀번호 확인을 입력해주세요.' }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: '비밀번호가 일치하지 않습니다.',
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
