// next-intl 수동 목 (node_modules 대상이라 모든 테스트에 자동 적용).
// 실제 next-intl은 ESM이라 Jest(next/jest)가 파싱하지 못하고, useTranslations는 Intl 컨텍스트를
// 요구한다. 컴포넌트 테스트가 Provider 래핑 없이도 동작하도록, ko 메시지를 그대로 조회하는
// 경량 t를 돌려준다(단순 {var} 치환 지원). 기존 한글 단언이 그대로 통과한다.
import calendar from '@/messages/ko/calendar.json';
import common from '@/messages/ko/common.json';
import dashboard from '@/messages/ko/dashboard.json';
import favorites from '@/messages/ko/favorites.json';
import goals from '@/messages/ko/goals.json';
import login from '@/messages/ko/login.json';
import me from '@/messages/ko/me.json';
import posts from '@/messages/ko/posts.json';
import settings from '@/messages/ko/settings.json';
import sidebar from '@/messages/ko/sidebar.json';
import signup from '@/messages/ko/signup.json';
import todos from '@/messages/ko/todos.json';
import validation from '@/messages/ko/validation.json';

const messages: Record<string, unknown> = {
  calendar,
  common,
  dashboard,
  favorites,
  goals,
  login,
  me,
  posts,
  settings,
  sidebar,
  signup,
  todos,
  validation,
};

function resolve(namespace: string, key: string): string {
  const path = namespace ? `${namespace}.${key}` : key;
  let cur: unknown = messages;
  for (const part of path.split('.')) {
    cur = (cur as Record<string, unknown> | undefined)?.[part];
  }
  return typeof cur === 'string' ? cur : path;
}

function interpolate(template: string, values?: Record<string, unknown>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) => (name in values ? String(values[name]) : `{${name}}`));
}

function makeTranslator(namespace = '') {
  const t = (key: string, values?: Record<string, unknown>) => interpolate(resolve(namespace, key), values);
  t.rich = (key: string) => resolve(namespace, key);
  t.markup = (key: string) => resolve(namespace, key);
  t.raw = (key: string) => resolve(namespace, key);
  t.has = (key: string) => resolve(namespace, key) !== (namespace ? `${namespace}.${key}` : key);
  return t;
}

export function useTranslations(namespace?: string) {
  return makeTranslator(namespace);
}

export const useLocale = () => 'ko';
export const useMessages = () => messages;
export const useFormatter = () => ({});
export const useNow = () => new Date();
export const useTimeZone = () => 'Asia/Seoul';

// Provider/플러그인 류는 children 그대로 통과시킨다.
export const NextIntlClientProvider = ({ children }: { children: unknown }) => children;
