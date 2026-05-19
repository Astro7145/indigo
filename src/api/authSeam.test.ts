import { getAccessToken, refreshAccessToken } from '@/src/api/authSeam'
import { NotImplementedError } from '@/src/types/common'

describe('authSeam (inert)', () => {
  it('getAccessToken resolves to null until BFF is wired', async () => {
    await expect(getAccessToken()).resolves.toBeNull()
  })

  it('refreshAccessToken rejects with NotImplementedError', async () => {
    await expect(refreshAccessToken()).rejects.toBeInstanceOf(NotImplementedError)
  })
})
