const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
};

export function stripHtml(html: string): string {
  return html
    .replace(/<(p|div|br|li|h[1-6])[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;|&#\d+;/gi, (entity) => ENTITIES[entity] ?? '')
    .trim();
}
