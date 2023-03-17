# Connect Redis Stack

_Connect Redis Stack_ provides [Redis](https://redis.io/) session storage for your [Express](https://expressjs.com/) applications using the JSON capabilites of [Redis Stack](https://redis.io/docs/stack/).

## Installation

Installation is a breeze but _Connect Redis Stack_ assumes that you already have [redis](https://www.npmjs.com/package/redis)—version 4 or greater—and [express-session](https://www.npmjs.com/package/express-session) installed. And, of course, it assumes you're building an Express application. So you probably should [express](https://www.npmjs.com/package/express) installed too.

To install the Redis bits, just do the following:

```bash
npm install redis connect-redis-stack
```

## The tl;dr

This will probably cover what you need. If not, open an issue or send me a pull request for a README with more words. If you're famliiar with Express and Expresss Session, you'll be fine:

```typescript
import express from 'express'
import session from 'express-session'

import { createClient } from 'redis'
import { RedisStackStore } from 'connect-redis-stack'


/* get connected to Redis */
const redis = createClient()
redis.on('error', error => console.log('Redis Client Error', error))
await redis.connect()

/* configure your store */
const store = new RedisStackStore({
  client: redis,        // required: ¯\_(ツ)_/¯
  prefix: 'appname:',   // optional: defaults to 'session:'
  ttlInSeconds: 3600    // optional: defaults to non-expiring session
})

/* create your app */
const  app = express()

/* tell it to use the session store */
app.use(
  session({
    store: store,
    resave: false,             // we implement the touch method so probably false, see https://github.com/expressjs/session#resave
    saveUninitialized: false,  // probably false, see https://github.com/expressjs/session#saveuninitialized
    secret: '5UP3r 53Cr37'
  })
)

/* write to the session */
app.get('/write', (req, res) => {
  req.session.someSessionData = { alfa: 'foo', bravo: 42 }
  req.session.moreSessionData = [ 'alfa', 'bravo', 'charlie' ]
  res.send('Stuff was written to your session.')
})

/* read from the session */
app.get('/read', (req, res) => {
  const someData = req.session.someSessionData
  const moreData = req.session.moreSessionData
  res.send('Stuff was read from your session.')
})

/* start the  app */
app.listen(8080, () => console.log(`Example app listening on port 8080`))
```
