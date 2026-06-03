import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Dropdown, { computeMenuPosition } from '@/src/components/common/dropdown/Dropdown';

const triggerRect = {
  top: 100,
  bottom: 130,
  left: 50,
  right: 250,
  width: 200,
  height: 30,
  x: 50,
  y: 100,
  toJSON: () => ({}),
} as DOMRect;

describe('Dropdown root', () => {
  it('children을 렌더한다', () => {
    render(
      <Dropdown>
        <span>내용</span>
      </Dropdown>,
    );
    expect(screen.getByText('내용')).toBeInTheDocument();
  });

  it('기본 상태에서 메뉴가 렌더되지 않는다', () => {
    render(
      <Dropdown>
        <Dropdown.Trigger>열기</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>아이템</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('open=true면 메뉴가 열린 상태로 렌더된다', () => {
    render(
      <Dropdown open>
        <Dropdown.Menu>
          <Dropdown.Item>아이템</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('onOpenChange가 열림 상태 변경 시 호출된다', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(
      <Dropdown onOpenChange={handleChange}>
        <Dropdown.Trigger>열기</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>아이템</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: '열기' }));
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});

describe('Dropdown.Trigger', () => {
  it('클릭 시 메뉴가 열린다', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <Dropdown.Trigger>열기</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>아이템</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: '열기' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('열린 상태에서 클릭 시 닫힌다', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <Dropdown.Trigger>열기</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>아이템</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    const trigger = screen.getByRole('button', { name: '열기' });
    await user.click(trigger);
    await user.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('aria-haspopup과 aria-expanded 속성을 제공한다', () => {
    render(
      <Dropdown>
        <Dropdown.Trigger>열기</Dropdown.Trigger>
      </Dropdown>,
    );
    const trigger = screen.getByRole('button', { name: '열기' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('asChild=true면 children에 aria·onClick을 주입하고 button을 중첩하지 않는다', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <Dropdown.Trigger asChild>
          <button type="button">케밥</button>
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>아이템</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    const trigger = screen.getByRole('button', { name: '케밥' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger.querySelector('button')).toBeNull();
    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});

describe('Dropdown.Menu', () => {
  it('isOpen=false면 렌더되지 않는다', () => {
    render(
      <Dropdown>
        <Dropdown.Menu>
          <Dropdown.Item>아이템</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('isOpen=true면 role="menu"로 렌더된다', () => {
    render(
      <Dropdown open>
        <Dropdown.Menu>
          <Dropdown.Item>아이템</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('document.body에 포털로 렌더된다', () => {
    render(
      <Dropdown open>
        <Dropdown.Menu>
          <Dropdown.Item>아이템</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    expect(screen.getByRole('menu').parentElement).toBe(document.body);
  });

  it('fixed로 위치한다', () => {
    render(
      <Dropdown open>
        <Dropdown.Menu>
          <Dropdown.Item>아이템</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    expect(screen.getByRole('menu')).toHaveClass('fixed');
  });
});

describe('computeMenuPosition', () => {
  it('bottom-start는 트리거 왼쪽 모서리에 정렬한다', () => {
    expect(computeMenuPosition(triggerRect, 'bottom-start', 'large').left).toBe(50);
  });

  it('bottom-end는 트리거 오른쪽 모서리에 정렬한다', () => {
    expect(computeMenuPosition(triggerRect, 'bottom-end', 'large').left).toBe(250 - 400);
  });

  it('bottom-center는 트리거 중앙에 정렬한다', () => {
    // 중앙 x = 50 + 200/2 = 150, left = 150 - 400/2 = -50
    expect(computeMenuPosition(triggerRect, 'bottom-center', 'large').left).toBe(-50);
  });

  it('메뉴는 트리거 바로 아래(+4px)에 위치한다', () => {
    expect(computeMenuPosition(triggerRect, 'bottom-start', 'large').top).toBe(134);
  });

  it('full 사이즈는 트리거 너비를 따른다', () => {
    expect(computeMenuPosition(triggerRect, 'bottom-start', 'full').width).toBe(200);
  });

  it('small 사이즈는 고정 너비 102를 쓴다', () => {
    expect(computeMenuPosition(triggerRect, 'bottom-start', 'small').width).toBe(102);
  });
});

describe('Dropdown.Item', () => {
  it('클릭 시 onClick이 호출되고 메뉴가 닫힌다', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    const handleChange = jest.fn();
    render(
      <Dropdown onOpenChange={handleChange}>
        <Dropdown.Trigger>열기</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item onClick={handleClick}>수정하기</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: '열기' }));
    await user.click(screen.getByRole('menuitem', { name: '수정하기' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('disabled 아이템 클릭 시 onClick이 호출되지 않는다', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(
      <Dropdown open onOpenChange={() => {}}>
        <Dropdown.Menu>
          <Dropdown.Item onClick={handleClick} disabled>
            비활성
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('menuitem', { name: '비활성' }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('disabled 아이템에 aria-disabled="true"가 설정된다', () => {
    render(
      <Dropdown open onOpenChange={() => {}}>
        <Dropdown.Menu>
          <Dropdown.Item disabled>비활성</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    expect(screen.getByRole('menuitem', { name: '비활성' })).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('닫힘 동작', () => {
  it('메뉴 외부를 클릭하면 닫힌다', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Dropdown>
          <Dropdown.Trigger>열기</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>아이템</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <button>외부 버튼</button>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: '열기' }));
    await user.click(screen.getByRole('button', { name: '외부 버튼' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('Escape 키를 누르면 닫힌다', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <Dropdown.Trigger>열기</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>아이템</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: '열기' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('Escape 후 트리거로 포커스가 돌아온다', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <Dropdown.Trigger>열기</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>아이템</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: '열기' }));
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: '열기' })).toHaveFocus();
  });
});

describe('클릭 전파 차단', () => {
  it('트리거를 클릭해도 바깥 카드의 클릭이 실행되지 않는다', async () => {
    const user = userEvent.setup();
    const handleCardClick = jest.fn();
    render(
      <div onClick={handleCardClick}>
        <Dropdown>
          <Dropdown.Trigger>열기</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>아이템</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: '열기' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(handleCardClick).not.toHaveBeenCalled();
  });

  it('아이템을 선택해도 바깥 카드의 클릭이 실행되지 않는다', async () => {
    const user = userEvent.setup();
    const handleCardClick = jest.fn();
    const handleItemClick = jest.fn();
    render(
      <div onClick={handleCardClick}>
        <Dropdown>
          <Dropdown.Trigger>열기</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleItemClick}>아이템</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: '열기' }));
    await user.click(screen.getByRole('menuitem', { name: '아이템' }));
    expect(handleItemClick).toHaveBeenCalledTimes(1);
    expect(handleCardClick).not.toHaveBeenCalled();
  });
});

describe('포커스 관리', () => {
  it('메뉴가 열리면 첫 번째 활성 아이템에 포커스가 간다', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <Dropdown.Trigger>열기</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>첫번째</Dropdown.Item>
          <Dropdown.Item>두번째</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: '열기' }));
    expect(screen.getByRole('menuitem', { name: '첫번째' })).toHaveFocus();
  });

  it('selected 아이템이 있으면 열릴 때 그 아이템에 포커스가 간다', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <Dropdown.Trigger>열기</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>첫번째</Dropdown.Item>
          <Dropdown.Item selected>두번째</Dropdown.Item>
          <Dropdown.Item>세번째</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: '열기' }));
    expect(screen.getByRole('menuitem', { name: '두번째' })).toHaveFocus();
  });

  it('첫 번째 아이템이 disabled면 두 번째 아이템에 포커스가 간다', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <Dropdown.Trigger>열기</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item disabled>비활성</Dropdown.Item>
          <Dropdown.Item>두번째</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: '열기' }));
    expect(screen.getByRole('menuitem', { name: '두번째' })).toHaveFocus();
  });
});

describe('키보드 네비게이션', () => {
  it('↓ 키로 다음 아이템으로 이동한다', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <Dropdown.Trigger>열기</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>첫번째</Dropdown.Item>
          <Dropdown.Item>두번째</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: '열기' }));
    expect(screen.getByRole('menuitem', { name: '첫번째' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: '두번째' })).toHaveFocus();
  });

  it('↑ 키로 이전 아이템으로 이동한다', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <Dropdown.Trigger>열기</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>첫번째</Dropdown.Item>
          <Dropdown.Item>두번째</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: '열기' }));
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: '첫번째' })).toHaveFocus();
  });

  it('마지막 아이템에서 ↓를 눌러도 이동하지 않는다', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <Dropdown.Trigger>열기</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>첫번째</Dropdown.Item>
          <Dropdown.Item>두번째</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: '열기' }));
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: '두번째' })).toHaveFocus();
  });

  it('↓ 키가 disabled 아이템을 건너뛴다', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <Dropdown.Trigger>열기</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>첫번째</Dropdown.Item>
          <Dropdown.Item disabled>비활성</Dropdown.Item>
          <Dropdown.Item>세번째</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: '열기' }));
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: '세번째' })).toHaveFocus();
  });
});
