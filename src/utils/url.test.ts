import { normalizeUrl } from './url';

describe('normalizeUrl', () => {
  it('프로토콜이 없으면 https://를 붙인다', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
  });

  it('이미 http://로 시작하면 그대로 둔다', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('이미 https://로 시작하면 그대로 둔다', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('빈 문자열이면 그대로 반환한다', () => {
    expect(normalizeUrl('')).toBe('');
  });
});
