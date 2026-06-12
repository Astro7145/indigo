import { loginSchema, signupSchema } from './schema';

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

const validSignup = {
  name: '홍길동',
  email: 'user@example.com',
  password: 'password123',
  passwordConfirm: 'password123',
};

describe('signupSchema', () => {
  it('모든 필드가 유효하면 통과한다', () => {
    const result = signupSchema.safeParse(validSignup);
    expect(result.success).toBe(true);
  });

  describe('name 필드', () => {
    it('빈 문자열이면 에러를 반환한다', () => {
      const result = signupSchema.safeParse({ ...validSignup, name: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.name?.[0]).toBe('이름을 입력해주세요.');
      }
    });

    it('20자를 초과하면 에러를 반환한다', () => {
      const result = signupSchema.safeParse({ ...validSignup, name: 'a'.repeat(21) });
      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.name?.[0]).toBe('이름은 20자 이하로 입력해주세요.');
      }
    });

    it('정확히 20자면 통과한다', () => {
      const result = signupSchema.safeParse({ ...validSignup, name: 'a'.repeat(20) });
      expect(result.success).toBe(true);
    });
  });

  describe('email 필드', () => {
    it('이메일 형식이 아니면 에러를 반환한다', () => {
      const result = signupSchema.safeParse({ ...validSignup, email: 'not-an-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.email?.[0]).toBe('올바른 이메일을 입력해주세요.');
      }
    });

    it('빈 문자열이면 에러를 반환한다', () => {
      const result = signupSchema.safeParse({ ...validSignup, email: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.email?.[0]).toBe('올바른 이메일을 입력해주세요.');
      }
    });
  });

  describe('password 필드', () => {
    it('8자 미만이면 에러를 반환한다', () => {
      const result = signupSchema.safeParse({ ...validSignup, password: 'short', passwordConfirm: 'short' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.password?.[0]).toBe('비밀번호가 8자 이상이 되도록 해 주세요.');
      }
    });

    it('정확히 8자이면 통과한다', () => {
      const result = signupSchema.safeParse({ ...validSignup, password: '12345678', passwordConfirm: '12345678' });
      expect(result.success).toBe(true);
    });
  });

  describe('passwordConfirm 필드', () => {
    it('빈 문자열이면 에러를 반환한다', () => {
      const result = signupSchema.safeParse({ ...validSignup, passwordConfirm: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.passwordConfirm?.[0]).toBe('비밀번호 확인을 입력해주세요.');
      }
    });

    it('password와 다르면 에러를 반환한다', () => {
      const result = signupSchema.safeParse({ ...validSignup, passwordConfirm: 'different123' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors.passwordConfirm?.[0]).toBe('비밀번호가 일치하지 않습니다.');
      }
    });
  });
});
