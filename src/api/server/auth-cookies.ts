// 인증 쿠키 이름 상수 (의존성 없는 모듈).
// server-fetcher(서버 전용, axios·next/server import)와 middleware(Edge 런타임) 양쪽이
// import 하므로, 무거운 의존성과 분리해 Edge 번들에 끌려들어가지 않도록 한다.
export const COOKIE = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
} as const;
