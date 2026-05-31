jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ back: jest.fn(), push: jest.fn() })),
}));

jest.mock('@/src/api/post', () => ({
  ...jest.requireActual('@/src/api/post'),
  createPost: jest.fn(),
  getPost: jest.fn(),
  patchPost: jest.fn(),
}));

jest.mock('@/src/api/upload', () => ({
  ...jest.requireActual('@/src/api/upload'),
  createImageUploadUrl: jest.fn(),
}));

// 단위 테스트 격리: PostEditor 자체는 별도 테스트 — 여기서는 wiring만 검증
jest.mock('@/src/components/post/PostEditor', () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    onImageClick,
  }: {
    value: string;
    onChange: (html: string) => void;
    onImageClick?: () => void;
  }) => (
    <>
      <textarea
        data-testid="post-editor-mock"
        aria-label="본문"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="button" onClick={onImageClick}>
        편집기-이미지-트리거
      </button>
    </>
  ),
}));

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { createPost, getPost, patchPost } from '@/src/api/post';
import { createImageUploadUrl } from '@/src/api/upload';
import PostForm from '@/src/components/post/PostForm';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: jest.fn() });
});

it('빈 작성 폼에서 등록 버튼은 비활성이다', () => {
  renderWithClient(<PostForm mode="create" />);

  expect(screen.getByRole('button', { name: '등록' })).toBeDisabled();
});

it('제목과 본문이 모두 입력되면 등록 버튼이 활성화된다', () => {
  renderWithClient(<PostForm mode="create" />);

  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '제목입니다' } });
  fireEvent.change(screen.getByLabelText('본문'), { target: { value: '<p>본문 내용</p>' } });

  expect(screen.getByRole('button', { name: '등록' })).toBeEnabled();
});

it('등록 클릭 시 createPost를 호출하고 상세 페이지로 이동한다', async () => {
  const push = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push, back: jest.fn() });
  (createPost as jest.Mock).mockResolvedValue({ id: 42 });

  renderWithClient(<PostForm mode="create" />);
  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '제목' } });
  fireEvent.change(screen.getByLabelText('본문'), { target: { value: '<p>본문</p>' } });
  fireEvent.click(screen.getByRole('button', { name: '등록' }));

  await waitFor(() =>
    expect(createPost).toHaveBeenCalledWith(expect.objectContaining({ title: '제목', content: '<p>본문</p>' })),
  );
  await waitFor(() => expect(push).toHaveBeenCalledWith('/posts/42'));
});

it('수정 모드에서는 초기값을 로드하고 수정 클릭 시 patchPost를 호출한다', async () => {
  (getPost as jest.Mock).mockResolvedValue({
    id: 7,
    title: '원래 제목',
    content: '<p>원래 본문</p>',
    image: null,
  });
  (patchPost as jest.Mock).mockResolvedValue({ id: 7 });
  const push = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push, back: jest.fn() });

  renderWithClient(<PostForm mode="edit" postId={7} />);

  await waitFor(() => expect(screen.getByLabelText('제목')).toHaveValue('원래 제목'));

  fireEvent.click(screen.getByRole('button', { name: '수정' }));

  await waitFor(() =>
    expect(patchPost).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ title: '원래 제목', content: '<p>원래 본문</p>' }),
    ),
  );
  await waitFor(() => expect(push).toHaveBeenCalledWith('/posts/7'));
});

it('변경사항이 있을 때 취소 클릭 시 confirm Modal이 열리고 즉시 뒤로 가지 않는다', () => {
  const back = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back });

  renderWithClient(<PostForm mode="create" />);
  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '제목' } });
  fireEvent.click(screen.getByRole('button', { name: '취소' }));

  expect(screen.getByRole('button', { name: '나가기' })).toBeInTheDocument();
  expect(back).not.toHaveBeenCalled();
});

it('변경사항이 없을 때 취소 클릭 시 Modal 없이 바로 뒤로 간다', () => {
  const back = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back });

  renderWithClient(<PostForm mode="create" />);
  fireEvent.click(screen.getByRole('button', { name: '취소' }));

  expect(back).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('button', { name: '나가기' })).not.toBeInTheDocument();
});

it('confirm Modal에서 나가기 클릭 시 뒤로 간다', () => {
  const back = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back });

  renderWithClient(<PostForm mode="create" />);
  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '제목' } });
  fireEvent.click(screen.getByRole('button', { name: '취소' }));
  fireEvent.click(screen.getByRole('button', { name: '나가기' }));

  expect(back).toHaveBeenCalledTimes(1);
});

it('이미지 삭제 버튼 클릭 시 이미지 카드가 사라진다', async () => {
  (createImageUploadUrl as jest.Mock).mockResolvedValue({
    uploadUrl: 'https://signed.url/upload',
    url: 'https://cdn.url/final.png',
  });
  global.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;

  const { container } = renderWithClient(<PostForm mode="create" />);

  const file = new File(['x'], 'photo.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText('이미지 파일 선택'), { target: { files: [file] } });

  await waitFor(() => expect(container.querySelector('img')).toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: '이미지 삭제' }));

  expect(container.querySelector('img')).not.toBeInTheDocument();
});

it('이미지 파일 선택 시 createImageUploadUrl과 PUT을 호출하고 이미지 카드를 렌더한다', async () => {
  (createImageUploadUrl as jest.Mock).mockResolvedValue({
    uploadUrl: 'https://signed.url/upload',
    url: 'https://cdn.url/final.png',
  });
  global.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;

  const { container } = renderWithClient(<PostForm mode="create" />);

  const file = new File(['x'], 'photo.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText('이미지 파일 선택'), { target: { files: [file] } });

  await waitFor(() => expect(createImageUploadUrl).toHaveBeenCalledWith({ fileName: 'photo.png' }));
  await waitFor(() =>
    expect(global.fetch).toHaveBeenCalledWith('https://signed.url/upload', expect.objectContaining({ method: 'PUT' })),
  );
  await waitFor(() => expect(container.querySelector('img')).toBeInTheDocument());
});
