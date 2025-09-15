import { OAuth2Client } from 'google-auth-library'
import dotenv from 'dotenv'

dotenv.config()

const clientId = process.env.GOOGLE_CLIENT_ID


// setting google client 
const client = new OAuth2Client({
  clientId
})

export async function verifyIdToken(idToken) {

  const data = await client.verifyIdToken({
    idToken: idToken,
    audience: clientId
  })

  const userData = data.getPayload()

  return userData;
}

