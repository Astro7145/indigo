import { loginSchema } from './schema';

describe('loginSchema', () => {
  describe('email 필드', () => {
    it('유효한 이메일이면 통과한다', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: 'pass' });
      expect(result.success).toBe(true);
    });

    it('빈 문자열이면 에러를 반환한다', () => {
      const result = loginSchema.safeParse({ email: '', password: 'pass' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.email?.[0]).toBe('올바른 이메일을 입력해주세요.');
      }
    });

    it('이메일 형식이 아니면 에러를 반환한다', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'pass' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.email?.[0]).toBe('올바른 이메일을 입력해주세요.');
      }
    });
  });

  describe('password 필드', () => {
    it('비밀번호가 한 글자 이상이면 통과한다', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: 'a' });
      expect(result.success).toBe(true);
    });

    it('빈 문자열이면 에러를 반환한다', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.password?.[0]).toBe('비밀번호는 필수 입력입니다.');
      }
    });
  });
});
