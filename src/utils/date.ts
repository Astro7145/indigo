import { CalendarDate, parseAbsolute, toCalendarDate } from '@internationalized/date';

/** DB의 ISO 문자열(자정 UTC)을 달력상의 하루(CalendarDate)로 변환. 로컬 타임존 드리프트 없음. */
export function isoToCalendarDate(iso: string | null): CalendarDate | null {
  return iso ? toCalendarDate(parseAbsolute(iso, 'UTC')) : null;
}

/** 선택한 날짜(CalendarDate)를 DB가 받는 자정 UTC ISO 문자열로 변환. */
export function calendarDateToIso(date: CalendarDate | null): string | null {
  return date ? date.toDate('UTC').toISOString() : null;
}

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** YYYY. MM. DD 포맷 (Figma 디자인 정렬, Asia/Seoul 고정) */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  return dateFormatter.format(date).replace(/-/g, '. ');
}
