import { createTodoCreateSchema, loginSchema, signupSchema } from './schema';

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

// 번역 키를 그대로 돌려주는 가짜 t — 메시지가 validation 카탈로그 키로 연결되는지 검증한다.
const fakeT = (key: string) => `t:${key}`;

describe('createTodoCreateSchema', () => {
  const todoSchema = createTodoCreateSchema(fakeT);
  const validTodo = { title: '운동하기', dueDate: '2026-06-12' };

  it('유효한 입력이면 통과한다', () => {
    expect(todoSchema.safeParse(validTodo).success).toBe(true);
  });

  it('제목이 비어 있으면 titleRequired 키 메시지를 반환한다', () => {
    const result = todoSchema.safeParse({ ...validTodo, title: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title?.[0]).toBe('t:titleRequired');
    }
  });

  it('제목이 30자를 초과하면 titleMax 키 메시지를 반환한다', () => {
    const result = todoSchema.safeParse({ ...validTodo, title: 'a'.repeat(31) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title?.[0]).toBe('t:titleMax');
    }
  });

  it('마감일이 비어 있으면 dueDateRequired 키 메시지를 반환한다', () => {
    const result = todoSchema.safeParse({ ...validTodo, dueDate: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.dueDate?.[0]).toBe('t:dueDateRequired');
    }
  });

  it('URL 형식이 아니면 urlInvalid 키 메시지를 반환한다', () => {
    const result = todoSchema.safeParse({ ...validTodo, linkUrl: 'not a url' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.linkUrl?.[0]).toBe('t:urlInvalid');
    }
  });

  it('프로토콜 없는 링크는 https://를 붙여 통과시킨다', () => {
    const result = todoSchema.safeParse({ ...validTodo, linkUrl: 'example.com' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.linkUrl).toBe('https://example.com');
    }
  });
});
