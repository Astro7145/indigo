// 프로토콜 없이 입력된 URL에 https://를 붙여 보정한다 (todo 폼·노트 링크 모달 공용)
export function normalizeUrl(value: string): string {
  if (!value) return value;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

const MAX_URL_LENGTH = 2048;
// TLD(점 + 알파벳 2자 이상)를 가진 도메인 호스트만 통과시킨다 → IP 리터럴·단일 라벨 호스트 거부.
// 비ASCII TLD(예: .한국)는 new URL()이 퓨니코드(xn--…)로 변환하므로 함께 허용한다.
const DOMAIN_WITH_TLD = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[a-z]{2,}|xn--[a-z0-9-]+)$/i;

// 입력은 normalizeUrl로 프로토콜이 보정된 문자열을 전제로 한다.
export function isValidLinkUrl(value: string): boolean {
  if (!value || value.length > MAX_URL_LENGTH) return false;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  // http/https만 허용 (javascript:·data:·ftp: 등 거부)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  // 자격증명(user:pass@) 거부
  if (url.username || url.password) return false;

  // IPv6 리터럴은 호스트가 대괄호로 감싸지므로 거부, localhost·서브도메인 거부
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost')) return false;

  // TLD를 가진 도메인만 허용 → 모든 IPv4 리터럴과 단일 라벨 호스트가 자연히 거부된다
  return DOMAIN_WITH_TLD.test(host);
}
