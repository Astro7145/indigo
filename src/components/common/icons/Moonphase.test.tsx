import { render } from '@testing-library/react';

import Moonphase from '@/src/components/common/icons/Moonphase';

// lit(밝은) 영역 path — fill이 light 그라데이션을 참조
const litPath = (container: HTMLElement) =>
  container.querySelector<SVGPathElement>('path[fill*="-light"]')?.getAttribute('d');

it('percent에 따라 밝은 영역 path가 달라진다', () => {
  const { container: c0 } = render(<Moonphase percent={0} />);
  const { container: c50 } = render(<Moonphase percent={50} />);
  const { container: c100 } = render(<Moonphase percent={100} />);
  expect(litPath(c0)).not.toEqual(litPath(c50));
  expect(litPath(c50)).not.toEqual(litPath(c100));
});

it('반달(50%)은 터미네이터 rx=0인 직선 경계를 만든다', () => {
  const { container } = render(<Moonphase percent={50} />);
  expect(litPath(container)).toContain('A0 68.75');
});

it('보름달(100%)은 구체 전체를 덮는 원형 윤곽이다', () => {
  const { container } = render(<Moonphase percent={100} />);
  expect(litPath(container)).toContain('178.75A68.75 68.75 0 0 0 110 41.25Z');
});

it('장식용이므로 svg는 aria-hidden이다', () => {
  const { container } = render(<Moonphase percent={50} />);
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden');
});
