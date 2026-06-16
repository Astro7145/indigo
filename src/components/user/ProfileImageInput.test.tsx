// 수동 목(ko 메시지 조회) 대신 "네임스페이스.키"(보간 값은 뒤에 이어붙임)를 돌려주는 t로 오버라이드한다.
// 렌더 결과가 번역 키와 일치하면 문구가 하드코딩이 아니라 카탈로그를 경유한다는 뜻이다.
jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    const t = (key: string, values?: Record<string, unknown>) => {
      const id = namespace ? `${namespace}.${key}` : key;
      return values ? `${id} ${Object.values(values).join(' ')}` : id;
    };
    return t;
  },
  useLocale: () => 'ko',
}));

const mockShowToast = jest.fn();

jest.mock('@/src/hooks/useToast', () => ({ useToast: () => ({ showToast: mockShowToast }) }));
jest.mock('@/src/hooks/user', () => ({ useMe: () => ({ data: { name: '체다치즈', image: null } }) }));

import { fireEvent, render, screen } from '@testing-library/react';

import ProfileImageInput from '@/src/components/user/ProfileImageInput';
import { useProfileImageStore } from '@/src/stores/profileImage';

beforeAll(() => {
  // jsdom에는 createObjectURL이 없다 — 미리보기 URL 생성만 대체한다.
  Object.assign(URL, { createObjectURL: jest.fn(() => 'blob:mock'), revokeObjectURL: jest.fn() });
});

afterEach(() => {
  jest.clearAllMocks();
  useProfileImageStore.getState().reset();
});

describe('ProfileImageInput i18n', () => {
  it('프로필 이미지 영역의 alt·버튼·파일 입력 라벨을 번역 키로 렌더한다', () => {
    render(<ProfileImageInput />);

    expect(screen.getByRole('img', { name: 'me.image.alt' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'me.image.change' })).toBeInTheDocument();
    expect(screen.getByLabelText('me.image.select')).toBeInTheDocument();
  });

  it('지원하지 않는 확장자를 선택하면 unsupported 키 토스트를 띄운다', () => {
    render(<ProfileImageInput />);

    const file = new File(['x'], 'note.txt', { type: 'text/plain' });
    fireEvent.change(screen.getByLabelText('me.image.select'), { target: { files: [file] } });

    expect(mockShowToast).toHaveBeenCalledWith('me.image.unsupported', 'error');
  });

  it('유효한 파일을 선택하면 파일명이 보간된 selected 상태 메시지를 알린다', () => {
    render(<ProfileImageInput />);

    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('me.image.select'), { target: { files: [file] } });

    expect(screen.getByText('common.file.selected photo.png')).toBeInTheDocument();
  });
});
