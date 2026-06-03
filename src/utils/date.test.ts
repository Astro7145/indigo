import { CalendarDate } from '@internationalized/date';
import { isoToCalendarDate, calendarDateToIso, formatDotDate } from './date';

describe('isoToCalendarDate', () => {
  it('DB의 ISO 문자열을 해당 날짜로 변환한다', () => {
    const result = isoToCalendarDate('2026-02-20T00:00:00.000Z');
    expect(result?.toString()).toBe('2026-02-20');
  });

  it('값이 없으면 null을 반환한다', () => {
    expect(isoToCalendarDate(null)).toBeNull();
  });

  it('타임존이 달라도 UTC 기준 날짜가 밀리지 않는다', () => {
    // 자정 UTC를 로컬로 환산하면 하루 밀릴 수 있으나, UTC 기준이므로 그대로 유지
    const result = isoToCalendarDate('2026-01-01T00:00:00.000Z');
    expect(result?.toString()).toBe('2026-01-01');
  });
});

describe('calendarDateToIso', () => {
  it('선택한 날짜를 DB가 받는 자정 UTC ISO 문자열로 변환한다', () => {
    const result = calendarDateToIso(new CalendarDate(2026, 2, 20));
    expect(result).toBe('2026-02-20T00:00:00.000Z');
  });

  it('값이 없으면 빈 값을 반환한다', () => {
    expect(calendarDateToIso(null)).toBeNull();
  });
});

describe('isoToCalendarDate ↔ calendarDateToIso', () => {
  it('변환 후 되돌리면 원래 ISO 문자열이 된다', () => {
    const iso = '2026-02-20T00:00:00.000Z';
    expect(calendarDateToIso(isoToCalendarDate(iso))).toBe(iso);
  });
});

describe('formatDotDate', () => {
  it('ISO 문자열을 yyyy. mm. dd 형식으로 변환한다', () => {
    expect(formatDotDate('2024-04-29T00:00:00.000Z')).toBe('2024. 04. 29');
  });

  it('한 자리 월·일을 0으로 채운다', () => {
    expect(formatDotDate('2024-01-05T00:00:00.000Z')).toBe('2024. 01. 05');
  });

  it('마감기한이 없으면(null) null을 반환한다', () => {
    expect(formatDotDate(null)).toBeNull();
  });
});
