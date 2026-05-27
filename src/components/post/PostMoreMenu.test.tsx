import { render, screen, fireEvent } from '@testing-library/react';

import PostMoreMenu from './PostMoreMenu';

describe('PostMoreMenu', () => {
  it('초기에는 메뉴가 닫혀 있다', () => {
    render(<PostMoreMenu onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.queryByRole('menuitem', { name: '수정하기' })).not.toBeInTheDocument();
  });

  it('더보기 버튼 클릭 시 수정/삭제 옵션이 노출된다', () => {
    render(<PostMoreMenu onEdit={() => {}} onDelete={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /더보기/ }));
    expect(screen.getByRole('menuitem', { name: '수정하기' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '삭제하기' })).toBeInTheDocument();
  });

  it('수정하기 클릭 시 onEdit이 호출되고 메뉴가 닫힌다', () => {
    const onEdit = jest.fn();
    render(<PostMoreMenu onEdit={onEdit} onDelete={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /더보기/ }));
    fireEvent.click(screen.getByRole('menuitem', { name: '수정하기' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menuitem', { name: '수정하기' })).not.toBeInTheDocument();
  });

  it('바깥 클릭 시 메뉴가 닫힌다', () => {
    render(
      <div>
        <PostMoreMenu onEdit={() => {}} onDelete={() => {}} />
        <button>outside</button>
      </div>,
    );
    fireEvent.click(screen.getByRole('button', { name: /더보기/ }));
    fireEvent.mouseDown(screen.getByRole('button', { name: 'outside' }));
    expect(screen.queryByRole('menuitem', { name: '수정하기' })).not.toBeInTheDocument();
  });
});
