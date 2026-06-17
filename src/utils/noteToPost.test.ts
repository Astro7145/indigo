import { noteContentToPostHtml, truncateHtmlToLimit } from './noteToPost';

it('Tiptap JSON을 HTML 문자열로 변환한다', () => {
  const json = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '안녕하세요' }] }] };
  const html = noteContentToPostHtml(json);
  expect(html).toBe('<p>안녕하세요</p>');
});

it('linkUrl이 있으면 HTML 말미에 a 태그로 추가한다', () => {
  const json = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '본문' }] }] };
  const html = noteContentToPostHtml(json, 'https://example.com');
  expect(html).toContain('<p>본문</p>');
  expect(html).toContain('관련 링크: <a href="https://example.com">https://example.com</a>');
});

it('linkUrl이 없으면 추가하지 않는다', () => {
  const json = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '본문' }] }] };
  const html = noteContentToPostHtml(json, null);
  expect(html).toBe('<p>본문</p>');
});

it('content가 undefined이면 빈 문자열을 반환한다', () => {
  const html = noteContentToPostHtml(undefined);
  expect(html).toBe('');
});

it('10000자 이하이면 그대로 반환한다', () => {
  const html = '<p>짧은 내용</p>';
  expect(truncateHtmlToLimit(html, 10000)).toBe(html);
});

it('10000자 초과 시 단락 경계에서 잘라낸다', () => {
  const short = '<p>첫 단락</p>';
  const long = '<p>' + 'a'.repeat(9990) + '</p>';
  const extra = '<p>잘려야 할 단락</p>';
  const html = short + long + extra;
  const result = truncateHtmlToLimit(html, 10000);
  expect(result).toContain('<p>첫 단락</p>');
  expect(result).not.toContain('잘려야 할 단락');
  expect(result.length).toBeLessThanOrEqual(10000);
});
