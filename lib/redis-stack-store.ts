import { Store } from 'express-session'
import { createClient, createCluster } from 'redis'


export type RedisClient = ReturnType<typeof createClient> | ReturnType<typeof createCluster>

export type RedisStackStoreOptions = {
  client: RedisClient
  prefix?: string
  ttlInSeconds?: number
}

export class RedisStackStore extends Store {

  #asyncStore: RedisStackAsyncStore

  constructor(options: RedisStackStoreOptions) {
    super()
    this.#asyncStore = new RedisStackAsyncStore(options)
  }

  get(sid: string, callback: (err: any, session?: any) => void): void {
    (async () => {
      try {
        const session = await this.#asyncStore.get(sid)
        callback(null, session)
      } catch (error) {
        callback(error)
      }
    })()
  }

  set(sid: string, session: any, callback?: (err?: any) => void): void {
    (async () => {
      try {
        await this.#asyncStore.set(sid, session)
        callback?.()
      } catch(error) {
        callback?.(error)
      }
    })()
  }

  destroy(sid: string, callback?: (err?: any) => void): void {
    (async () => {
      try {
        await this.#asyncStore.destroy(sid)
        callback?.()
      } catch(error) {
        callback?.(error)
      }
    })()
  }

  touch(sid: string, session: any, callback?: (err?: any) => void): void  {
    throw "Not implemented"
  }

  all(callback: (err: any, obj?: any[] | { [sid: string]: any } | null) => void): void {
    throw "Not implemented"
  }

  clear(callback?: (err?: any) => void): void {
    throw "Not implemented"
  }

  length(callback: (err: any, length?: number) => void): void {
    throw "Not implemented"
  }

}

class RedisStackAsyncStore {

  #redis
  #prefix
  #ttl?

  constructor(options: RedisStackStoreOptions) {
    this.#redis = options.client
    this.#prefix = options.prefix ?? 'session:'
    this.#ttl = options.ttlInSeconds
  }

  async get(sid: string): Promise<any> {
    const keyName = this.#keyName(sid)
    const json = await this.#redis.json.get(keyName)
    return json
  }

  async set(sid: string, session: any): Promise<void> {
    const keyName = this.#keyName(sid)
    await this.#redis.json.set(keyName, '$', session)
    if (this.#ttl !== undefined) await this.#redis.expire(keyName, this.#ttl)
  }

  async destroy(sid: string): Promise<void> {
    const keyName = this.#keyName(sid)
    await this.#redis.unlink(keyName)
  }

  #keyName(sid: string) {
    return `${this.#prefix}${sid}`
  }
}
