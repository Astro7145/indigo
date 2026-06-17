// 프로토콜 없이 입력된 URL에 https://를 붙여 보정한다 (todo 폼·노트 링크 모달 공용)
export function normalizeUrl(value: string): string {
  if (!value) return value;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
