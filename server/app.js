import DarkSky from 'dark-sky'
import express from 'express'
import Redis from './redis'
import cors from 'cors'

const app = express()
const port = 8000
const darksky = new DarkSky(process.env.DARK_SKY)
const redis = new Redis(13835, 'redis-13835.c16.us-east-1-3.ec2.cloud.redislabs.com')

app.use(cors())

async function query ({country, latitude, longitude}) {
  try {
    const randomnum = Math.floor((Math.random() * 9
    ))
    console.log('randomnum: ', randomnum)
    if (!randomnum) throw new Error('Random error')
    const cache = await redis.get(country)
    if (cache) return cache
    const data = await darksky
      .latitude(latitude)
      .longitude(longitude)
      .get()
    if (data && data.currently) redis.set(country, data)
    return data
  } catch (error) {
    console.log('error: ', error)
    if (error instanceof Error && error.message === 'Random error') {
      return query({country, latitude, longitude})
    }
    return error
  }
}

app.get('/v1/:country/:latitude/:longitude', async (request, response) => {
  query(request.params)
    .then(data => {
      response.json(data)
    })
    .catch(reason => {
      response.status(500).json({error: reason})
    })
})

app.listen(port, (err) => {
  if (err) {
    return console.log('Error on load server: ', err)
  }

  console.log(`Server is running and listening on ${port}`)
})
