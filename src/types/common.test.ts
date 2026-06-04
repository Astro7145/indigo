import { ApiError } from '@/src/types/common';

describe('ApiError', () => {
  it('status, code, message, details를 가지며 Error 인스턴스이다', () => {
    const e = new ApiError({ status: 404, code: 'NOT_FOUND', message: 'nope', details: { a: 1 } });
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe('ApiError');
    expect(e.status).toBe(404);
    expect(e.code).toBe('NOT_FOUND');
    expect(e.message).toBe('nope');
    expect(e.details).toEqual({ a: 1 });
  });
});
