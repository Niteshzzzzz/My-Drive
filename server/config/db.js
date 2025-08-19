import mongoose from 'mongoose'

export async function connectDB() {
  try {  
    await mongoose.connect('mongodb://nitesh:nitesh@127.0.0.1:27017/Storage')
    console.log('connected to database.')
  } catch (error) {
    console.log('Failed to connect the database!!!')
    console.log(error)
  }
}

process.on("SIGINT", async () => {
  await client.close();
  console.log("Client Disconnected!");
  process.exit(0);
});
