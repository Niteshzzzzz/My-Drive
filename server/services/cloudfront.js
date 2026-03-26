import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import dotenv from 'dotenv'

dotenv.config()

const domain = `https://d1unr1joxizm2w.cloudfront.net`;
const privateKey = process.env.PRIVATE_KEY;
const keyPairId = process.env.KEY_PAIR_ID;
const dateLessThan = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // any Date constructor compatible

export const getCloudFrontSignedUrl = ({ key, download, filename }) => {
    
    const url = `${domain}/${key}?response-content-disposition=${encodeURIComponent(`${download ? 'attachment' : 'inline' }; filename=${filename}`)}`

    const signedUrl = getSignedUrl({
        url,
        keyPairId,
        dateLessThan,
        privateKey,
    });

    return signedUrl
}