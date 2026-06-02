import DOMPurify from 'dompurify';

import { cn } from '@/src/utils/cn';

export interface NoteContentProps {
  /** note.content (HTML 문자열). 비-string이면 호출 측에서 ''로 변환해 전달. */
  html: string;
  className?: string;
}

/**
 * 노트 본문(HTML)을 sanitize 후 렌더한다. note.content는 contenteditable 산출 HTML이라
 * XSS 방지를 위해 DOMPurify가 필수다. 제목/리스트/굵게 등 기본 서식만 prose 스타일로 표시.
 */
export default function NoteContent({ html, className }: NoteContentProps) {
  // dompurify는 브라우저 전용(DOM 필요)이라 서버 렌더에선 빈 문자열로 두고 클라에서만 새니타이즈한다
  const clean = typeof window !== 'undefined' ? DOMPurify.sanitize(html) : '';
  return (
    <div
      className={cn(
        'text-sm leading-6 text-slate-700',
        '[&_b]:font-bold [&_em]:italic [&_strong]:font-bold',
        '[&_h1]:mt-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mt-2 [&_h2]:text-base [&_h2]:font-semibold',
        '[&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5',
        '[&_a]:text-indigo-600 [&_a]:underline',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
