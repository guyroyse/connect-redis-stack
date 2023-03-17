import { vi } from 'vitest'

export const createClient = vi.fn(() => {
  return {
    expire: vi.fn(),
    json: {
      get: vi.fn(),
      set: vi.fn()
    }
  }
})

vi.mock('redis', () => ({ createClient }))
