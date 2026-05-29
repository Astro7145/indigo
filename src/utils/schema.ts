import z from 'zod';

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
