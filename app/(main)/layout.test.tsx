import { render, screen } from '@testing-library/react';

import MainLayout from '@/app/(main)/layout';

it('children을 main 영역에 렌더한다', () => {
  render(
    <MainLayout>
      <div>대시보드 콘텐츠</div>
    </MainLayout>,
  );
  expect(screen.getByRole('main')).toHaveTextContent('대시보드 콘텐츠');
});
