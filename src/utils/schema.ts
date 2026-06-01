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

export const loginSchema = z.object({
  email: z.email({ error: '올바른 이메일을 입력해주세요.' }),
  password: z.string().min(1, { error: '비밀번호는 필수 입력입니다.' }),
});

export const signupSchema = z
  .object({
    name: z.string().min(1, { error: '이름을 입력해주세요.' }),
    email: z.email({ error: '올바른 이메일을 입력해주세요.' }),
    password: z.string().min(8, { error: '비밀번호가 8자 이상이 되도록 해 주세요.' }),
    passwordConfirm: z.string().min(1, { error: '비밀번호 확인을 입력해주세요.' }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: '비밀번호가 일치하지 않습니다.',
  });
