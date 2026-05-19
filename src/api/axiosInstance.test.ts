import type { AxiosAdapter } from 'axios'

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
  process.env.NEXT_PUBLIC_API_BASE_URL = '/api'
})

it('throws at load when NEXT_PUBLIC_API_BASE_URL is missing', () => {
  delete process.env.NEXT_PUBLIC_API_BASE_URL
  expect(() => loadInstance()).toThrow(/NEXT_PUBLIC_API_BASE_URL/)
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
