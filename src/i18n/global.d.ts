// next-intl 타입 증강 — useTranslations 키 자동완성·컴파일 타임 검증.
// defaultLocale(ko)의 메시지를 SSOT로 삼아 네임스페이스별 형태를 합친다.
// (request.ts의 messages 병합 구조와 동일하게 유지할 것)
import type { routing } from './routing';
import type calendar from '@/messages/ko/calendar.json';
import type common from '@/messages/ko/common.json';
import type dashboard from '@/messages/ko/dashboard.json';
import type favorites from '@/messages/ko/favorites.json';
import type goals from '@/messages/ko/goals.json';
import type login from '@/messages/ko/login.json';
import type me from '@/messages/ko/me.json';
import type posts from '@/messages/ko/posts.json';
import type settings from '@/messages/ko/settings.json';
import type sidebar from '@/messages/ko/sidebar.json';
import type signup from '@/messages/ko/signup.json';
import type todos from '@/messages/ko/todos.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: {
      calendar: typeof calendar;
      common: typeof common;
      dashboard: typeof dashboard;
      favorites: typeof favorites;
      goals: typeof goals;
      login: typeof login;
      me: typeof me;
      posts: typeof posts;
      settings: typeof settings;
      sidebar: typeof sidebar;
      signup: typeof signup;
      todos: typeof todos;
    };
  }
}
