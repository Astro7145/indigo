import { getRequestConfig } from 'next-intl/server';
import { isValidLocale, routing, type Locale } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // 현재 요청의 locale 확인. 유효하지 않으면 기본값으로 대체한다.
  const requested = await requestLocale;
  const locale: Locale = requested && isValidLocale(requested) ? requested : routing.defaultLocale;

  // 네임스페이스별 메시지 파일을 병렬로 로드해 하나의 messages 객체로 합친다.
  // 파일명 = 네임스페이스 키 (컴포넌트에서 useTranslations('todos') 형태로 접근)
  const [
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
  ] = await Promise.all([
    import(`@/messages/${locale}/calendar.json`),
    import(`@/messages/${locale}/common.json`),
    import(`@/messages/${locale}/dashboard.json`),
    import(`@/messages/${locale}/favorites.json`),
    import(`@/messages/${locale}/goals.json`),
    import(`@/messages/${locale}/login.json`),
    import(`@/messages/${locale}/me.json`),
    import(`@/messages/${locale}/posts.json`),
    import(`@/messages/${locale}/settings.json`),
    import(`@/messages/${locale}/sidebar.json`),
    import(`@/messages/${locale}/signup.json`),
    import(`@/messages/${locale}/todos.json`),
    import(`@/messages/${locale}/validation.json`),
  ]);

  return {
    locale,
    messages: {
      calendar: calendar.default,
      common: common.default,
      dashboard: dashboard.default,
      favorites: favorites.default,
      goals: goals.default,
      login: login.default,
      me: me.default,
      posts: posts.default,
      settings: settings.default,
      sidebar: sidebar.default,
      signup: signup.default,
      todos: todos.default,
      validation: validation.default,
    },
  };
});
