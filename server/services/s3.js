import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
    // profile: 'storageApp',
    region: process.env.region,
    credentials: {
        accessKeyId: process.env.aws_access_key_id,
        secretAccessKey: process.env.aws_secret_access_key,
    }
})

export const createUploadSignedUrl = async (key, contentType) => {

    const command = new PutObjectCommand({
        Bucket: 'aws-storage-app',
        Key: key,
        ContentType: contentType
    })

    const url = await getSignedUrl(s3Client, command, {
        expiresIn: 300,
        signableHeaders: new Set(["content-type"]),
    });

    return url
}

export const createGetSignedUrl = async ({key, download = false, filename}) => {
    // return;
    const command = new GetObjectCommand({
        Bucket: 'aws-storage-app',
        Key: key,
        ResponseContentDisposition: `${download ? 'attachment' : 'inline'}; filename=${encodeURIComponent(filename)}`
    })

    const url = await getSignedUrl(s3Client, command, {
        expiresIn: 300
    });

    return url
}

export const getFileMetaData = async (key) => {
    // return;
    const command = new HeadObjectCommand({
        Bucket: 'aws-storage-app',
        Key: key
    })

    return await s3Client.send(command)
}

export const deleteS3File = async (key) => {
    // return;
    const command = new DeleteObjectCommand({
        Bucket: 'aws-storage-app',
        Key: key
    })

    return await s3Client.send(command)
}


export const deleteS3Files = async (keys) => {
    // return;
    const command = new DeleteObjectsCommand({
        Bucket: 'aws-storage-app',
        Delete: {
            Objects: keys,
            Quiet: false
        }
    })

    return await s3Client.send(command)
}