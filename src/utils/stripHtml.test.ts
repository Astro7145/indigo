import { stripHtml } from './stripHtml';

it('일반 텍스트는 그대로 반환한다', () => {
  expect(stripHtml('안녕하세요')).toBe('안녕하세요');
});

it('HTML 태그를 제거한다', () => {
  expect(stripHtml('<p>본문</p>')).toBe('본문');
  expect(stripHtml('<b>굵게</b> <i>기울임</i>')).toBe('굵게 기울임');
});

it('블록 태그는 공백으로 치환해 줄바꿈을 띄어쓰기로 보존한다', () => {
  expect(stripHtml('<p>첫줄</p><p>둘째줄</p>')).toBe('첫줄 둘째줄');
  expect(stripHtml('첫줄<br>둘째줄')).toBe('첫줄 둘째줄');
});

it('HTML 엔티티를 디코딩한다', () => {
  expect(stripHtml('Tom &amp; Jerry')).toBe('Tom & Jerry');
  expect(stripHtml('&lt;tag&gt;')).toBe('<tag>');
  expect(stripHtml('&quot;인용&quot;')).toBe('"인용"');
});

it('알 수 없는 엔티티는 원본 그대로 보존한다', () => {
  expect(stripHtml('알수없음 &foo;')).toBe('알수없음 &foo;');
});

it('대문자 엔티티도 동일하게 디코딩한다', () => {
  expect(stripHtml('Tom &AMP; Jerry')).toBe('Tom & Jerry');
});
