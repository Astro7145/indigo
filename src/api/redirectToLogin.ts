// 인증 실패(401) 시 로그인 페이지로 보내는 브라우저 네비게이션 경계.
// 실패한 페이지를 history에 남기지 않도록 replace를 사용한다.
// axiosInstance에서 분리한 이유: jsdom의 location.replace가 잠겨 있어 테스트에서 이 경계를 모킹한다.
export function redirectToLogin(): void {
  window.location.replace('/login');
}
