import { generateHTML } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

// StarterKit v3에 Underline이 포함돼 있으므로 별도 등록 없이 StarterKit + TextAlign만 사용
const EXTENSIONS = [StarterKit, TextAlign.configure({ types: ['heading', 'paragraph'] })];

export const POST_CONTENT_MAX = 10000;

export function noteContentToPostHtml(content: unknown, linkUrl?: string | null): string {
  if (content == null) return '';
  const html = generateHTML(content as JSONContent, EXTENSIONS);
  if (!linkUrl) return html;
  return `<p>관련 링크: <a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkUrl}</a></p>` + html;
}

/** 단락 경계에서 limit 이내로 잘라낸다. */
export function truncateHtmlToLimit(html: string, limit: number): string {
  if (html.length <= limit) return html;
  const blockClose = /<\/(p|ul|ol|h[1-6]|blockquote|li)>/gi;
  let lastSafe = 0;
  let match;
  while ((match = blockClose.exec(html)) !== null) {
    const end = match.index + match[0].length;
    if (end <= limit) lastSafe = end;
    else break;
  }
  return html.slice(0, lastSafe || limit);
}
