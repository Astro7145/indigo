import { CalendarDate, parseAbsolute, toCalendarDate } from '@internationalized/date';

/** DB의 ISO 문자열(자정 UTC)을 달력상의 하루(CalendarDate)로 변환. 로컬 타임존 드리프트 없음. */
export function isoToCalendarDate(iso: string | null): CalendarDate | null {
  return iso ? toCalendarDate(parseAbsolute(iso, 'UTC')) : null;
}

/** 선택한 날짜(CalendarDate)를 DB가 받는 자정 UTC ISO 문자열로 변환. */
export function calendarDateToIso(date: CalendarDate | null): string | null {
  return date ? date.toDate('UTC').toISOString() : null;
}
