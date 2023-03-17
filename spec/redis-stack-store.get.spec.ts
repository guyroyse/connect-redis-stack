import './mock-redis'
import { createClient } from 'redis'

import { RedisClient, RedisStackStore } from '$lib/redis-stack-store'

const SIMPLE_SESSION = { session: 'data' }

describe("RedisStackStore", () => {

  let subject: RedisStackStore
  let redis: RedisClient

  // this just creates a mocked Redis client
  beforeEach(() => { redis = createClient() })

  describe("#get", () => {

    describe("when unconfigured", () => {

      beforeEach(() => { subject = new RedisStackStore({ client: redis }) })

      it("looks for a session using the default prefix and the session id", () => new Promise<void>(done => {
        subject.get('foo', (error, session) => {
          expect(redis.json.get).toHaveBeenCalledWith('session:foo')
          done()
        })
      }))

      it("returns a found session", () => new Promise<void>(done => {
        vi.mocked(redis.json.get).mockResolvedValue(SIMPLE_SESSION)
        subject.get('foo', (error, session) => {
          expect(session).toEqual(SIMPLE_SESSION)
          done()
        })
      }))

      it("doesn't return an error", () => new Promise<void>(done => {
        vi.mocked(redis.json.get).mockResolvedValue(SIMPLE_SESSION)
        subject.get('foo', (error, session) => {
          expect(error).toBeNull()
          done()
        })
      }))

      it("returns null for a missing session", () => new Promise<void>(done => {
        vi.mocked(redis.json.get).mockResolvedValue(null)
        subject.get('missing', (error, session) => {
          expect(session).toBeNull()
          done()
        })
      }))

      it("doesn't return an error for a missing session", () => new Promise<void>(done => {
        vi.mocked(redis.json.get).mockResolvedValue(null)
        subject.get('missing', (error, session) => {
          expect(error).toBeNull()
          done()
        })
      }))

      it("returns an error when one occurs", () => new Promise<void>(done => {
        vi.mocked(redis.json.get).mockRejectedValue(new Error("An error has occurred"))
        subject.get('foo', (error, session) => {
          expect(error.message).toEqual("An error has occurred")
          expect(session).toBeUndefined()
          done()
        })
      }))
    })

    describe("when configured with a prefix", () => {

      beforeEach(async () => { subject = new RedisStackStore({ client: redis, prefix: 'custom:' }) })

      it("looks for a session using the configured prefix and the session id", () => new Promise<void>(done => {
        subject.get('foo', (error, session) => {
          expect(redis.json.get).toHaveBeenCalledWith('custom:foo')
          done()
        })
      }))
    })
  })
})
