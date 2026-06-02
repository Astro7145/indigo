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
  uploadToPresignedUrl: jest.fn(),
}));

// 단위 테스트 격리: PostEditor 자체는 별도 테스트 — 여기서는 wiring만 검증
jest.mock('@/src/components/post/PostEditor', () => ({
  __esModule: true,
  default: ({
    value,
    onChange,
    onImageClick,
    titleSlot,
  }: {
    value: string;
    onChange: (html: string) => void;
    onImageClick?: () => void;
    titleSlot?: React.ReactNode;
  }) => (
    <>
      {titleSlot}
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
import { createImageUploadUrl, uploadToPresignedUrl } from '@/src/api/upload';
import PostForm from '@/src/components/post/PostForm';
import { renderWithClient } from '@/src/hooks/__tests__/test-utils';

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back: jest.fn() });
});

it('빈 작성 폼에서 등록 버튼은 비활성이다', () => {
  renderWithClient(<PostForm mode="create" />);

  expect(screen.getByRole('button', { name: '등록하기' })).toBeDisabled();
});

it('제목 입력 시 0/30 카운터가 갱신된다', () => {
  renderWithClient(<PostForm mode="create" />);

  expect(screen.getByText('0/30')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '안녕하세요' } });
  expect(screen.getByText('5/30')).toBeInTheDocument();
});

it('본문 입력 시 공백포함/공백제외 글자수 푸터가 갱신된다', () => {
  renderWithClient(<PostForm mode="create" />);

  expect(screen.getByText('공백포함 0자 | 공백제외 0자')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('본문'), { target: { value: '<p>안녕 하세요</p>' } });
  expect(screen.getByText('공백포함 6자 | 공백제외 5자')).toBeInTheDocument();
});

it('제목과 본문이 모두 입력되면 등록 버튼이 활성화된다', () => {
  renderWithClient(<PostForm mode="create" />);

  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '제목입니다' } });
  fireEvent.change(screen.getByLabelText('본문'), { target: { value: '<p>본문 내용</p>' } });

  expect(screen.getByRole('button', { name: '등록하기' })).toBeEnabled();
});

it('등록 클릭 시 createPost를 호출하고 상세 페이지로 이동한다', async () => {
  const push = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push, back: jest.fn() });
  (createPost as jest.Mock).mockResolvedValue({ id: 42 });

  renderWithClient(<PostForm mode="create" />);
  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '제목' } });
  fireEvent.change(screen.getByLabelText('본문'), { target: { value: '<p>본문</p>' } });
  fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

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

  fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

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

  expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
  expect(back).not.toHaveBeenCalled();
});

it('변경사항이 없을 때 취소 클릭 시 Modal 없이 바로 뒤로 간다', () => {
  const back = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back });

  renderWithClient(<PostForm mode="create" />);
  fireEvent.click(screen.getByRole('button', { name: '취소' }));

  expect(back).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('button', { name: '확인' })).not.toBeInTheDocument();
});

it('confirm Modal에서 나가기 클릭 시 뒤로 간다', () => {
  const back = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), back });

  renderWithClient(<PostForm mode="create" />);
  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '제목' } });
  fireEvent.click(screen.getByRole('button', { name: '취소' }));
  fireEvent.click(screen.getByRole('button', { name: '확인' }));

  expect(back).toHaveBeenCalledTimes(1);
});

it('이미지 삭제 버튼 클릭 시 이미지 카드가 사라진다', async () => {
  const { container } = renderWithClient(<PostForm mode="create" />);

  const file = new File(['x'], 'photo.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText('이미지 파일 선택'), { target: { files: [file] } });

  await waitFor(() => expect(container.querySelector('img')).toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: '이미지 삭제' }));

  expect(container.querySelector('img')).not.toBeInTheDocument();
});

it('이미지 파일 선택만으로는 업로드가 일어나지 않고 미리보기만 표시된다', async () => {
  const { container } = renderWithClient(<PostForm mode="create" />);

  const file = new File(['x'], 'photo.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText('이미지 파일 선택'), { target: { files: [file] } });

  await waitFor(() => expect(container.querySelector('img')).toBeInTheDocument());
  expect(createImageUploadUrl).not.toHaveBeenCalled();
  expect(uploadToPresignedUrl).not.toHaveBeenCalled();
});

it('등록 클릭 시점에 이미지가 업로드되고 createPost에 업로드된 URL이 전달된다', async () => {
  (createImageUploadUrl as jest.Mock).mockResolvedValue({
    uploadUrl: 'https://signed.url/upload',
    url: 'https://cdn.url/final.png',
  });
  (uploadToPresignedUrl as jest.Mock).mockResolvedValue(undefined);
  (createPost as jest.Mock).mockResolvedValue({ id: 42 });
  const push = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push, back: jest.fn() });

  renderWithClient(<PostForm mode="create" />);

  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '제목' } });
  fireEvent.change(screen.getByLabelText('본문'), { target: { value: '<p>본문</p>' } });
  const file = new File(['x'], 'photo.png', { type: 'image/png' });
  fireEvent.change(screen.getByLabelText('이미지 파일 선택'), { target: { files: [file] } });

  fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

  await waitFor(() => expect(createImageUploadUrl).toHaveBeenCalledWith({ fileName: 'photo.png' }));
  await waitFor(() => expect(uploadToPresignedUrl).toHaveBeenCalledWith('https://signed.url/upload', expect.any(File)));
  await waitFor(() =>
    expect(createPost).toHaveBeenCalledWith(
      expect.objectContaining({ title: '제목', content: '<p>본문</p>', image: 'https://cdn.url/final.png' }),
    ),
  );
  await waitFor(() => expect(push).toHaveBeenCalledWith('/posts/42'));
});

it('수정 모드에서 데이터 로딩 중에는 폼 대신 "불러오는 중…"이 보인다', () => {
  (getPost as jest.Mock).mockReturnValue(new Promise(() => {})); // never resolves

  renderWithClient(<PostForm mode="edit" postId={7} />);

  expect(screen.getByText('불러오는 중…')).toBeInTheDocument();
  expect(screen.queryByLabelText('제목')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: '수정하기' })).not.toBeInTheDocument();
});

it('수정 모드에서 기존 이미지를 삭제하고 저장하면 patchPost에 image: null이 전송된다', async () => {
  (getPost as jest.Mock).mockResolvedValue({
    id: 7,
    title: '원래 제목',
    content: '<p>원래 본문</p>',
    image: 'https://cdn.url/old.png',
  });
  (patchPost as jest.Mock).mockResolvedValue({ id: 7 });

  renderWithClient(<PostForm mode="edit" postId={7} />);

  await waitFor(() => expect(screen.getByLabelText('제목')).toHaveValue('원래 제목'));

  fireEvent.click(screen.getByRole('button', { name: '이미지 삭제' }));
  fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

  await waitFor(() =>
    expect(patchPost).toHaveBeenCalledWith(7, {
      title: '원래 제목',
      content: '<p>원래 본문</p>',
      image: null,
    }),
  );
});
