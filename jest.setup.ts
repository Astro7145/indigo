// DOM 요소를 테스트할 때 매우 유용한 커스텀 매처(matcher)들을 제공
// toBeInTheDocument(), toHaveTextContent(), toBeVisible() 등
// 1. 전역 설정: 모든 테스트 파일에서 이 매처들을 별도로 import 하지 않고도 사용할 수 있습니다.
// 2. 코드 중복 방지: 각 테스트 파일마다 동일한 import문을 반복하지 않아도 됩니다.
// 3. 일관성 유지: 모든 테스트에 동일한 확장 기능이 적용되므로 테스트 코드가 일관성을 유지합니다.
// 4. 설정 집중화: 테스트 환경 설정을 한 곳에서 관리할 수 있어 나중에 변경이 필요할 때 편리합니다.
import '@testing-library/jest-dom'

// @/src/types/common은 순수 타입/클래스 모듈이므로 실제 구현을 그대로 사용하되,
// jest.isolateModules 내부에서도 동일한 클래스 참조를 공유하기 위해 전역 mock으로 등록한다.
// 이렇게 하면 isolateModules 경계를 넘어도 instanceof 검사가 올바르게 동작한다.
jest.mock('@/src/types/common', () => jest.requireActual('@/src/types/common'))
// 전역 mockRegistry에 캐시를 미리 올려 isolateModules 안에서도 같은 참조가 반환되도록 한다.
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@/src/types/common')
