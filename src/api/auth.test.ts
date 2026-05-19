jest.mock('@/src/api/axiosInstance')
import instance from '@/src/api/axiosInstance'
import { signup, login, refresh, logout, oauthLogin } from '@/src/api/auth'

const mocked = instance as jest.Mocked<typeof instance>
beforeEach(() => {
  jest.resetAllMocks()
  mocked.post.mockResolvedValue({ data: {} } as never)
})

it('login POSTs /auth/login', async () => {
  await login({ email: 'a@b.c', password: 'pw' })
  expect(mocked.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.c', password: 'pw' })
})
it('signup POSTs /auth/signup', async () => {
  await signup({ email: 'a@b.c', name: 'n', password: 'pw' })
  expect(mocked.post).toHaveBeenCalledWith('/auth/signup', { email: 'a@b.c', name: 'n', password: 'pw' })
})
it('refresh POSTs /auth/refresh', async () => {
  await refresh({ refreshToken: 'r' })
  expect(mocked.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'r' })
})
it('logout POSTs /auth/logout', async () => {
  await logout({ refreshToken: 'r' })
  expect(mocked.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'r' })
})
it('oauthLogin POSTs /oauth/:provider', async () => {
  await oauthLogin('google', { token: 't' })
  expect(mocked.post).toHaveBeenCalledWith('/oauth/google', { token: 't' })
})
