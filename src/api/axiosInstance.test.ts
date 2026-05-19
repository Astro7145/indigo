import type { AxiosAdapter } from 'axios'

jest.mock('@/src/api/authSeam')
import * as seam from '@/src/api/authSeam'
import { NotImplementedError } from '@/src/types/common'

const mockedSeam = seam as jest.Mocked<typeof seam>

function loadInstance() {
  let mod: typeof import('@/src/api/axiosInstance')
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require('@/src/api/axiosInstance')
  })
  // @ts-expect-error assigned in isolateModules
  return mod.default
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.test/team1'
  jest.resetAllMocks()
  mockedSeam.getAccessToken.mockResolvedValue(null)
})

it('throws at load when NEXT_PUBLIC_API_BASE_URL is missing', () => {
  delete process.env.NEXT_PUBLIC_API_BASE_URL
  expect(() => loadInstance()).toThrow(/NEXT_PUBLIC_API_BASE_URL/)
})

it('attaches Authorization when seam returns a token', async () => {
  mockedSeam.getAccessToken.mockResolvedValue('tok-123')
  const instance = loadInstance()
  let seen = ''
  instance.defaults.adapter = (async (config) => {
    seen = String(config.headers?.Authorization ?? '')
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
  }) as AxiosAdapter
  await instance.get('/todos')
  expect(seen).toBe('Bearer tok-123')
})

it('omits Authorization when seam returns null', async () => {
  const instance = loadInstance()
  let seen: unknown = 'unset'
  instance.defaults.adapter = (async (config) => {
    seen = config.headers?.Authorization
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
  }) as AxiosAdapter
  await instance.get('/todos')
  expect(seen).toBeUndefined()
})

it('normalizes a 404 response into ApiError', async () => {
  const instance = loadInstance()
  instance.defaults.adapter = (async (config) => {
    return Promise.reject({
      isAxiosError: true,
      message: 'Request failed',
      config,
      response: { data: { message: 'missing', code: 'NOT_FOUND' }, status: 404, statusText: '', headers: {}, config },
    })
  }) as AxiosAdapter
  await expect(instance.get('/todos/1')).rejects.toMatchObject({
    name: 'ApiError', status: 404, code: 'NOT_FOUND', message: 'missing',
  })
})

it('normalizes a network error (no response) into ApiError status 0', async () => {
  const instance = loadInstance()
  instance.defaults.adapter = (async () => {
    return Promise.reject({ isAxiosError: true, message: 'Network Error' })
  }) as AxiosAdapter
  const err = await instance.get('/todos').catch((e) => e)
  expect(err.name).toBe('ApiError')
  expect(err.status).toBe(0)
})

it('single-flight: concurrent 401s trigger refresh once, then retry', async () => {
  mockedSeam.refreshAccessToken.mockResolvedValue(undefined)
  const instance = loadInstance()
  let calls = 0
  instance.defaults.adapter = (async (config) => {
    calls += 1
    // @ts-expect-error custom retry guard
    if (config.__isRetry) {
      return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config }
    }
    return Promise.reject({
      isAxiosError: true, message: '401', config,
      response: { data: { message: 'unauthorized' }, status: 401, statusText: '', headers: {}, config },
    })
  }) as AxiosAdapter

  const results = await Promise.all([instance.get('/a'), instance.get('/b'), instance.get('/c')])
  expect(results.every((r) => r.data.ok)).toBe(true)
  expect(mockedSeam.refreshAccessToken).toHaveBeenCalledTimes(1)
  expect(calls).toBe(6)
})

it('does not refresh when seam throws NotImplementedError; propagates 401 ApiError', async () => {
  mockedSeam.refreshAccessToken.mockRejectedValue(new NotImplementedError('nope'))
  const instance = loadInstance()
  instance.defaults.adapter = (async (config) => {
    return Promise.reject({
      isAxiosError: true, message: '401', config,
      response: { data: { message: 'unauthorized' }, status: 401, statusText: '', headers: {}, config },
    })
  }) as AxiosAdapter
  const err = await instance.get('/secure').catch((e) => e)
  expect(err.name).toBe('ApiError')
  expect(err.status).toBe(401)
})
