jest.mock('@/src/api/axiosInstance')
import instance from '@/src/api/axiosInstance'
import { signup, login, refresh, logout, oauthLogin, authKeys } from '@/src/api/auth'

const mocked = instance as jest.Mocked<typeof instance>
beforeEach(() => {
  jest.resetAllMocks()
  mocked.post.mockResolvedValue({ data: { user: { id: 1, email: 'a@b.c', name: 'n', image: null } } } as never)
})

it('login POSTs /auth/login and returns { user }', async () => {
  const r = await login({ email: 'a@b.c', password: 'pw' })
  expect(mocked.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.c', password: 'pw' })
  expect(r).toEqual({ user: { id: 1, email: 'a@b.c', name: 'n', image: null } })
})
it('signup POSTs /auth/signup and returns { user }', async () => {
  const r = await signup({ email: 'a@b.c', name: 'n', password: 'pw' })
  expect(mocked.post).toHaveBeenCalledWith('/auth/signup', { email: 'a@b.c', name: 'n', password: 'pw' })
  expect(r).toEqual({ user: { id: 1, email: 'a@b.c', name: 'n', image: null } })
})
it('refresh POSTs /auth/refresh with no body and returns void', async () => {
  mocked.post.mockResolvedValue({ data: undefined } as never)
  const r = await refresh()
  expect(mocked.post).toHaveBeenCalledWith('/auth/refresh')
  expect(r).toBeUndefined()
})
it('logout POSTs /auth/logout with no body and returns void', async () => {
  mocked.post.mockResolvedValue({ data: undefined } as never)
  const r = await logout()
  expect(mocked.post).toHaveBeenCalledWith('/auth/logout')
  expect(r).toBeUndefined()
})
it('oauthLogin POSTs /oauth/:provider and returns { user }', async () => {
  const r = await oauthLogin('google', { token: 't' })
  expect(mocked.post).toHaveBeenCalledWith('/oauth/google', { token: 't' })
  expect(r).toEqual({ user: { id: 1, email: 'a@b.c', name: 'n', image: null } })
})
it('authKeys.all is stable', () => {
  expect(authKeys.all).toEqual(['auth'])
})
