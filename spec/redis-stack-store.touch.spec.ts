import './mock-redis'
import { createClient } from 'redis'

import { RedisClient, RedisStackStore } from '$lib/redis-stack-store'

const SIMPLE_SESSION = { session: 'data' }

describe("RedisStackStore", () => {

  let subject: RedisStackStore
  let redis: RedisClient

  beforeEach(() => { redis = createClient() })

  describe("#touch", () => {

    describe("when unconfigured", () => {

      beforeEach(() => { subject = new RedisStackStore({ client: redis }) })

      describe("when called with a callback", () => {
        it("does not touch the session", () => new Promise<void>(done => {
          subject.touch('foo', SIMPLE_SESSION, (error) => {
            expect(redis.expire).not.toHaveBeenCalled()
            expect(error).toBeUndefined()
            done()
          })
        }))
      })

      describe("when called without a callback", () => {
        it("does not touch the session", () => {
          subject.touch('foo', SIMPLE_SESSION)
          expect(redis.expire).not.toHaveBeenCalled()
        })
      })
    })

    describe("when configured with a ttl", () => {

      beforeEach(() => { subject = new RedisStackStore({ client: redis, ttlInSeconds: 42 }) })

      describe("when called with a callback", () => {

        it("expires the session data using the configured ttl", () => new Promise<void>(done => {
          subject.touch('foo', SIMPLE_SESSION, (error) => {
            expect(redis.expire).toHaveBeenCalledWith('session:foo', 42)
            expect(error).toBeUndefined()
            done()
          })
        }))

        describe("and Redis generates an error", () => {
          it("returns the error", () => new Promise<void>(done => {
            vi.mocked(redis.expire).mockRejectedValue(new Error("An error has occurred"))
            subject.touch('foo', SIMPLE_SESSION, (error) => {
              expect(error.message).toEqual("An error has occurred")
              done()
            })
          }))
        })
      })

      describe("when called without a callback", () => {

        it("expires the session data using the configured ttl", () => {
          subject.touch('foo', SIMPLE_SESSION)
          expect(redis.expire).toHaveBeenCalledWith('session:foo', 42)
        })

        describe("and Redis generates an error", () => {
          it("eats the error", () => {
            vi.mocked(redis.expire).mockRejectedValue(new Error("An error has occurred"))
            subject.touch('foo', SIMPLE_SESSION)
          })
        })
      })
    })

    describe("when configured with a prefix and a ttl", () => {

      beforeEach(() => { subject = new RedisStackStore({ client: redis, prefix: 'custom:', ttlInSeconds: 42 }) })

      it("expires the session data using the configured ttl and prefix", () => new Promise<void>(done => {
        subject.set('foo', SIMPLE_SESSION, (error) => {
          expect(redis.expire).toHaveBeenCalledWith('custom:foo', 42)
          expect(error).toBeUndefined()
          done()
        })
      }))
    })
  })
})
