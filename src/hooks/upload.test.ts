jest.mock('@/src/api/upload', () => ({
  ...jest.requireActual('@/src/api/upload'),
  createImageUploadUrl: jest.fn(),
  createFileUploadUrl: jest.fn(),
  uploadImageToS3: jest.fn(),
}));
import * as uploadApi from '@/src/api/upload';
import { renderHookWithClient } from '@/src/hooks/__tests__/test-utils';
import { useCreateImageUploadUrl, useCreateFileUploadUrl, useUploadImageToS3 } from '@/src/hooks/upload';

const mocked = uploadApi as jest.Mocked<typeof uploadApi>;

beforeEach(() => {
  jest.resetAllMocks();
});

it('useCreateImageUploadUrl는 body와 함께 createImageUploadUrl을 호출한다', async () => {
  mocked.createImageUploadUrl.mockResolvedValue({
    uploadUrl: 'u',
    url: 'f',
  } as never);
  const { result } = renderHookWithClient(() => useCreateImageUploadUrl());
  const res = await result.current.mutateAsync({ fileName: 'a.png' });
  expect(mocked.createImageUploadUrl).toHaveBeenCalledWith({
    fileName: 'a.png',
  });
  expect(res).toEqual({ uploadUrl: 'u', url: 'f' });
});

it('useCreateFileUploadUrl는 body와 함께 createFileUploadUrl을 호출한다', async () => {
  mocked.createFileUploadUrl.mockResolvedValue({
    uploadUrl: 'u',
    url: 'f',
  } as never);
  const { result } = renderHookWithClient(() => useCreateFileUploadUrl());
  await result.current.mutateAsync({ fileName: 'a.pdf' });
  expect(mocked.createFileUploadUrl).toHaveBeenCalledWith({ fileName: 'a.pdf' });
});

it('useUploadImageToS3는 uploadUrl과 file로 uploadImageToS3를 호출한다', async () => {
  mocked.uploadImageToS3.mockResolvedValue(undefined);
  const file = new File(['x'], 'a.png', { type: 'image/png' });
  const { result } = renderHookWithClient(() => useUploadImageToS3());
  await result.current.mutateAsync({ uploadUrl: 'https://s3/u', file });
  expect(mocked.uploadImageToS3).toHaveBeenCalledWith('https://s3/u', file);
});
