import redis from 'redis'

export default class Redis {
  constructor (port, host) {
    this.client = redis.createClient({
      port,
      host,
      retry_strategy: function (options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          // End reconnecting on a specific error and flush all commands with
          // a individual error
          return new Error('The server refused the connection')
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          // End reconnecting after a specific timeout and flush all commands
          // with a individual error
          return new Error('Retry time exhausted')
        }
        if (options.attempt > 10) {
          // End reconnecting with built in error
          return undefined
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000)
      }
    })
    this.client.on('connect', function () {
    })
  }

  set (key, value, expiration = 86400) {
    return new Promise((resolve, reject) => {
      value = JSON.stringify(value)
      this.client.set(key, value, (err, reply) => {
        if (err) {
          return reject(err)
        }
        this.client.expire(key, expiration)
        resolve(reply)
      })
    })
  }

  get (key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          return reject(err)
        }
        resolve(JSON.parse(reply))
      })
    })
  }

  del (key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          return reject(err)
        }
        resolve(reply)
      })
    })
  }
}
