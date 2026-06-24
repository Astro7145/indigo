import { isValidLinkUrl, normalizeUrl } from './url';

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

describe('isValidLinkUrl', () => {
  it('TLD를 가진 정상 도메인은 허용한다', () => {
    expect(isValidLinkUrl('https://example.com')).toBe(true);
    expect(isValidLinkUrl('http://example.com')).toBe(true);
    expect(isValidLinkUrl('https://sub.example.com/path?q=1#x')).toBe(true);
    expect(isValidLinkUrl('https://example.한국')).toBe(true);
  });

  it('TLD 없는 단일 라벨 호스트는 거부한다', () => {
    expect(isValidLinkUrl('http://a')).toBe(false);
    expect(isValidLinkUrl('https://example')).toBe(false);
  });

  it('http/https가 아닌 프로토콜은 거부한다', () => {
    expect(isValidLinkUrl('ftp://example.com')).toBe(false);
    expect(isValidLinkUrl('javascript:alert(1)')).toBe(false);
    expect(isValidLinkUrl('data:text/html,abc')).toBe(false);
  });

  it('localhost는 서브도메인 포함 거부한다', () => {
    expect(isValidLinkUrl('http://localhost')).toBe(false);
    expect(isValidLinkUrl('http://localhost:3000')).toBe(false);
    expect(isValidLinkUrl('http://app.localhost')).toBe(false);
  });

  it('IP 주소는 사설·루프백·공개 모두 거부한다', () => {
    expect(isValidLinkUrl('http://127.0.0.1')).toBe(false);
    expect(isValidLinkUrl('http://192.168.0.1')).toBe(false);
    expect(isValidLinkUrl('http://10.0.0.5')).toBe(false);
    expect(isValidLinkUrl('http://169.254.169.254')).toBe(false);
    expect(isValidLinkUrl('http://8.8.8.8')).toBe(false);
    expect(isValidLinkUrl('http://[::1]')).toBe(false);
  });

  it('자격증명이 포함된 URL은 거부한다', () => {
    expect(isValidLinkUrl('http://user:pass@example.com')).toBe(false);
    expect(isValidLinkUrl('http://user@example.com')).toBe(false);
  });

  it('2048자를 초과하면 거부한다', () => {
    const longUrl = `https://example.com/${'a'.repeat(2048)}`;
    expect(isValidLinkUrl(longUrl)).toBe(false);
  });

  it('파싱할 수 없는 문자열은 거부한다', () => {
    expect(isValidLinkUrl('not a url')).toBe(false);
    expect(isValidLinkUrl('')).toBe(false);
  });
});
