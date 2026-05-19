jest.mock('@/src/api/axiosInstance')
import instance from '@/src/api/axiosInstance'
import { createImageUploadUrl, createFileUploadUrl } from '@/src/api/upload'

const mocked = instance as jest.Mocked<typeof instance>
beforeEach(() => {
  jest.resetAllMocks()
  mocked.post.mockResolvedValue({ data: { uploadUrl: 'u', url: 'v' } } as never)
})

it('createImageUploadUrl POST /images', async () => {
  const r = await createImageUploadUrl({ fileName: 'a.png' })
  expect(mocked.post).toHaveBeenCalledWith('/images', { fileName: 'a.png' })
  expect(r).toEqual({ uploadUrl: 'u', url: 'v' })
})
it('createFileUploadUrl POST /files', async () => {
  await createFileUploadUrl({ fileName: 'r.pdf' })
  expect(mocked.post).toHaveBeenCalledWith('/files', { fileName: 'r.pdf' })
})
