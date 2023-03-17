import './mock-redis'
import { createClient } from 'redis'

import { RedisClient, RedisStackStore } from '$lib/redis-stack-store'

const SIMPLE_SESSION = { session: 'data' }

describe("RedisStackStore", () => {

  let subject: RedisStackStore
  let redis: RedisClient

  // this just creates a mocked Redis client
  beforeEach(() => { redis = createClient() })

  describe("#destroy", () => {

    describe("when unconfigured", () => {

      beforeEach(() => { subject = new RedisStackStore({ client: redis }) })

      describe("when called with a callback", () => {

        it("removes the session data using the default prefix and the session id", () => new Promise<void>(done => {
          subject.destroy('foo', (error) => {
            expect(redis.unlink).toHaveBeenCalledWith('session:foo')
            expect(error).toBeUndefined()
            done()
          })
        }))

        describe("and Redis generates an error", () => {
          it("returns the error", () => new Promise<void>(done => {
            vi.mocked(redis.unlink).mockRejectedValue(new Error("An error has occurred"))
            subject.destroy('foo', (error) => {
              expect(error.message).toEqual("An error has occurred")
              done()
            })
          }))
        })
      })

      describe("when called without a callback", () => {

        it("removes the session data using the default prefix and the session id", () => {
          subject.destroy('foo')
          expect(redis.unlink).toHaveBeenCalledWith('session:foo')
        })

        describe("and Redis generates an error", () => {
          it("eats the error", () => {
            vi.mocked(redis.unlink).mockRejectedValue(new Error("An error has occurred"))
            subject.destroy('foo')
          })
        })
      })
    })

    describe("when configured with a prefix", () => {

      beforeEach(() => { subject = new RedisStackStore({ client: redis, prefix: 'custom:' }) })

      it("removes the session data using the configured prefix and the session id", () => new Promise<void>(done => {
        subject.destroy('foo', (error) => {
          expect(redis.unlink).toHaveBeenCalledWith('custom:foo')
          expect(error).toBeUndefined()
          done()
        })
      }))
    })
  })
})
