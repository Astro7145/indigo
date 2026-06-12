jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn() }) }));

import { fireEvent, render, screen } from '@testing-library/react';

import SettingsModal from './SettingsModal';
import { useSettingsModalStore } from '@/src/stores/settingsModal';

afterEach(() => {
  useSettingsModalStore.setState({ isOpen: false });
});

describe('SettingsModal', () => {
  it('스토어가 열림 상태면 설정 모달이 보인다', () => {
    useSettingsModalStore.setState({ isOpen: true });
    render(<SettingsModal />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '설정' })).toBeInTheDocument();
  });

  it('닫힘 상태면 모달이 렌더되지 않는다', () => {
    render(<SettingsModal />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('취소 버튼을 누르면 스토어가 닫힌다', () => {
    useSettingsModalStore.setState({ isOpen: true });
    render(<SettingsModal />);

    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(useSettingsModalStore.getState().isOpen).toBe(false);
  });
});
