import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://nitesh:nitesh@127.0.0.1:27017/Storage'
  try {
    await mongoose.connect(uri)
    console.log('connected to database.')
  } catch (error) {
    console.log('Failed to connect the database!!!')
    console.log(error)
    throw error
  }
}

process.on("SIGINT", async () => {
  try {
    await mongoose.disconnect();
    console.log("Mongoose disconnected!");
  } catch (e) {
    console.error('Error during mongoose disconnect', e)
  }
  process.exit(0);
});
