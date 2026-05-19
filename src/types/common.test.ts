import { ApiError, NotImplementedError } from '@/src/types/common'

describe('ApiError', () => {
  it('carries status, code, message, details and is an Error', () => {
    const e = new ApiError({ status: 404, code: 'NOT_FOUND', message: 'nope', details: { a: 1 } })
    expect(e).toBeInstanceOf(Error)
    expect(e.name).toBe('ApiError')
    expect(e.status).toBe(404)
    expect(e.code).toBe('NOT_FOUND')
    expect(e.message).toBe('nope')
    expect(e.details).toEqual({ a: 1 })
  })
})

describe('NotImplementedError', () => {
  it('is identifiable by name', () => {
    const e = new NotImplementedError('refresh seam not wired')
    expect(e).toBeInstanceOf(Error)
    expect(e.name).toBe('NotImplementedError')
  })
})
