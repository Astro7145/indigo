jest.mock('@/src/api/axiosInstance')
import instance from '@/src/api/axiosInstance'
import { createImageUploadUrl, createFileUploadUrl } from '@/src/api/upload'

const mocked = instance as jest.Mocked<typeof instance>
beforeEach(() => {
  jest.resetAllMocks()
  mocked.post.mockResolvedValue({ data: { uploadUrl: 'u', url: 'v' } } as never)
})

it('createImageUploadUrl은 /images로 POST한다', async () => {
  const r = await createImageUploadUrl({ fileName: 'a.png' })
  expect(mocked.post).toHaveBeenCalledWith('/images', { fileName: 'a.png' })
  expect(r).toEqual({ uploadUrl: 'u', url: 'v' })
})
it('createFileUploadUrl은 /files로 POST한다', async () => {
  await createFileUploadUrl({ fileName: 'r.pdf' })
  expect(mocked.post).toHaveBeenCalledWith('/files', { fileName: 'r.pdf' })
})
