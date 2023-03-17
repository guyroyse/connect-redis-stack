import './mock-redis'
import { createClient } from 'redis'

import { RedisClient, RedisStackStore } from '$lib/redis-stack-store'

const SIMPLE_SESSION = { session: 'data' }

describe("RedisStackStore", () => {

  let subject: RedisStackStore
  let redis: RedisClient

  // this just creates a mocked Redis client
  beforeEach(() => { redis = createClient() })

  describe("#set", () => {

    describe("when unconfigured", () => {

      beforeEach(() => { subject = new RedisStackStore({ client: redis }) })

      describe("when called with a callback", () => {

        it("saves and does not expire the session data using the default prefix and the session id", () => new Promise<void>(done => {
          subject.set('foo', SIMPLE_SESSION, (error) => {
            expect(redis.json.set).toHaveBeenCalledWith('session:foo', '$', SIMPLE_SESSION)
            expect(redis.expire).not.toHaveBeenCalled()
            expect(error).toBeUndefined()
            done()
          })
        }))

        describe("and Redis generates an error", () => {
          it("returns the error", () => new Promise<void>(done => {
            vi.mocked(redis.json.set).mockRejectedValue(new Error("An error has occurred"))
            subject.set('foo', SIMPLE_SESSION, (error) => {
              expect(error.message).toEqual("An error has occurred")
              done()
            })
          }))
        })
      })

      describe("when called without a callback", () => {

        it("saves and does not expire the session data using the default prefix and the session id", () => {
          subject.set('foo', SIMPLE_SESSION)
          expect(redis.json.set).toHaveBeenCalledWith('session:foo', '$', SIMPLE_SESSION)
          expect(redis.expire).not.toHaveBeenCalled()
        })

        describe("and Redis generates an error", () => {
          it("eats the error", () => {
            vi.mocked(redis.json.set).mockRejectedValue(new Error("An error has occurred"))
            subject.set('foo', SIMPLE_SESSION)
          })
        })
      })
    })

    describe("when configured with a prefix", () => {

      beforeEach(() => { subject = new RedisStackStore({ client: redis, prefix: 'custom:' }) })

      it("saves and does not expire the session data using the configured prefix and the session id", () => new Promise<void>(done => {
        subject.set('foo', SIMPLE_SESSION, (error) => {
          expect(redis.json.set).toHaveBeenCalledWith('custom:foo', '$', SIMPLE_SESSION)
          expect(redis.expire).not.toHaveBeenCalled()
          expect(error).toBeUndefined()
          done()
        })
      }))
    })

    describe("when configured with a ttl", () => {

      beforeEach(() => { subject = new RedisStackStore({ client: redis, ttlInSeconds: 42 }) })

      it("saves and expires the session data using the configured ttl", () => new Promise<void>(done => {
        subject.set('foo', SIMPLE_SESSION, (error) => {
          expect(redis.json.set).toHaveBeenCalledWith('session:foo', '$', SIMPLE_SESSION)
          expect(redis.expire).toHaveBeenCalledWith('session:foo', 42)
          expect(error).toBeUndefined()
          done()
        })
      }))
    })
  })
})
