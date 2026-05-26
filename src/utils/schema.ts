import z from 'zod';

export const loginSchema = z.object({
  email: z.email({ error: '올바른 이메일을 입력해주세요.' }),
  password: z.string().min(1, { error: '비밀번호는 필수 입력입니다.' }),
});
