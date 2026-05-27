// DOM 요소를 테스트할 때 매우 유용한 커스텀 매처(matcher)들을 제공
// toBeInTheDocument(), toHaveTextContent(), toBeVisible() 등
// 1. 전역 설정: 모든 테스트 파일에서 이 매처들을 별도로 import 하지 않고도 사용할 수 있습니다.
// 2. 코드 중복 방지: 각 테스트 파일마다 동일한 import문을 반복하지 않아도 됩니다.
// 3. 일관성 유지: 모든 테스트에 동일한 확장 기능이 적용되므로 테스트 코드가 일관성을 유지합니다.
// 4. 설정 집중화: 테스트 환경 설정을 한 곳에서 관리할 수 있어 나중에 변경이 필요할 때 편리합니다.
import '@testing-library/jest-dom';

/**
 * jsdom은 IntersectionObserver를 구현하지 않는다. observe() 시 즉시 1회 교차 콜백을 호출하는 목.
 *
 * ⚠️  전 테스트 스위트 적용 주의:
 * observe()가 isIntersecting: true 로 동기(synchronous) 콜백을 발화한다.
 * 앞으로 IO 센티널을 렌더하는 컴포넌트를 테스트할 때는 콜백이 자동 트리거된다는 점을
 * 유의해야 한다 — 예: 무한 스크롤 fetchNextPage가 즉시 호출될 수 있다.
 */
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  constructor(private cb: IntersectionObserverCallback) {}
  observe = (target: Element) => {
    this.cb([{ isIntersecting: true, target } as IntersectionObserverEntry], this);
  };
  unobserve = () => {};
  disconnect = () => {};
  takeRecords = (): IntersectionObserverEntry[] => [];
}
global.IntersectionObserver = MockIntersectionObserver;
