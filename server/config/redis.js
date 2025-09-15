import { createClient } from 'redis'
import dotenv from 'dotenv'

dotenv.config()

const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379'

const redisClient = createClient({ url })

redisClient.on('error', (err) => console.error('Redis Client Error', err))

export async function connectRedis() {
  try {
    if (!redisClient.isOpen) await redisClient.connect()
    console.log('Connected to Redis')
  } catch (err) {
    console.error('Could not connect to Redis', err)
    throw err
  }
}

export async function disconnectRedis() {
  try {
    if (redisClient.isOpen) await redisClient.quit()
    console.log('Disconnected from Redis')
  } catch (err) {
    console.error('Error disconnecting from Redis', err)
  }
}

export default redisClient
