import type { JSONContent } from '@tiptap/core';

import { loadDraft, saveDraft, clearDraft, noteDraftKey } from './noteDraftStorage';

const content: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: '임시 본문' }] }],
};

beforeEach(() => {
  localStorage.clear();
});

it('임시저장한 제목·본문을 그대로 다시 불러온다', () => {
  saveDraft(12, { title: '임시 제목', content });

  const draft = loadDraft(12);
  expect(draft?.title).toBe('임시 제목');
  expect(draft?.content).toEqual(content);
});

it('저장된 초안이 없으면 불러오기 결과가 비어 있다', () => {
  expect(loadDraft(12)).toBeNull();
});

it('임시저장 시점이 함께 기록된다', () => {
  saveDraft(12, { title: '임시 제목', content });

  const draft = loadDraft(12);
  expect(draft?.savedAt).toEqual(expect.any(String));
  expect(Number.isNaN(Date.parse(draft!.savedAt))).toBe(false);
});

it('할일별로 초안이 따로 보관된다', () => {
  saveDraft(1, { title: '1번 초안', content });
  saveDraft(2, { title: '2번 초안', content });

  expect(loadDraft(1)?.title).toBe('1번 초안');
  expect(loadDraft(2)?.title).toBe('2번 초안');
});

it('초안을 비우면 다시 불러올 수 없다', () => {
  saveDraft(12, { title: '임시 제목', content });
  clearDraft(12);

  expect(loadDraft(12)).toBeNull();
});

it('저장값이 깨져 있어도 불러오기가 터지지 않고 비어 있는 것으로 본다', () => {
  localStorage.setItem(noteDraftKey(12), '{깨진 JSON');

  expect(loadDraft(12)).toBeNull();
});

it('첨부 링크도 함께 임시저장되고 그대로 불러와진다', () => {
  saveDraft(12, { title: '임시 제목', content, linkUrl: 'https://example.com' });

  expect(loadDraft(12)?.linkUrl).toBe('https://example.com');
});

it('첨부 링크 없이 저장하면 불러올 때도 링크가 없다', () => {
  saveDraft(12, { title: '임시 제목', content });

  expect(loadDraft(12)?.linkUrl).toBeUndefined();
});
