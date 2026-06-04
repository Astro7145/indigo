import { CalendarDate, parseAbsolute, toCalendarDate } from '@internationalized/date';

/** DB의 ISO 문자열(자정 UTC)을 달력상의 하루(CalendarDate)로 변환. 로컬 타임존 드리프트 없음. */
export function isoToCalendarDate(iso: string | null): CalendarDate | null {
  return iso ? toCalendarDate(parseAbsolute(iso, 'UTC')) : null;
}

/** 선택한 날짜(CalendarDate)를 DB가 받는 자정 UTC ISO 문자열로 변환. */
export function calendarDateToIso(date: CalendarDate | null): string | null {
  return date ? date.toDate('UTC').toISOString() : null;
}

/**
 * 현재 시각 대비 상대 시간을 한국어로 포맷한다.
 * 1시간 미만 → "방금", 1일 미만 → "N시간", 그 외 → "YYYY.MM.DD".
 * 빈 값/잘못된 날짜는 빈 문자열을 반환한다.
 * @param now 현재 시각(ms). 테스트용 주입 파라미터. 기본값 `Date.now()`.
 */
export function formatRelativeTime(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return '';
  const past = new Date(iso);
  if (Number.isNaN(past.getTime())) return '';
  const diffSec = Math.max(0, Math.floor((now - past.getTime()) / 1000));
  if (diffSec < 3600) return '방금';
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간`;
  // ISO 문자열을 slice(0,10)으로 자르는 다른 곳들과 일관되도록 UTC 기준으로 포맷한다.
  const y = past.getUTCFullYear();
  const m = String(past.getUTCMonth() + 1).padStart(2, '0');
  const d = String(past.getUTCDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}
