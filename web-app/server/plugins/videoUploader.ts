import fs from 'node:fs'
// import { readFile } from 'node:fs/promises'
import path from 'node:path'
// import stream from 'node:stream'
import { finished } from 'node:stream/promises'
import { outputFolder } from './videoRecorder'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

let filesToUpload: string[] = []
let isUploadingInProgress = false
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
})

const upload = async (filePath: string) => {
    console.info(`uploader: check if "${filePath}" already exists in S3`)
    const response = await s3Client.send(new HeadObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || '',
        Key: path.basename(filePath),
    })).catch(() => undefined)
    if (response?.ContentLength != undefined && response.ContentLength > 0) {
        console.info(`uploader: file "${filePath}" already exists in S3, skipping upload`)
        await fs.promises.unlink(filePath)
        filesToUpload.splice(filesToUpload.indexOf(filePath), 1)
        return
    }
    console.info(`uploader: uploading "${filePath}" to S3`)
    const readStream = fs.createReadStream(filePath)
    const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME || '',
        Key: path.basename(filePath),
        Body: readStream,
        ContentType: 'video/mp4',
    }
    try {
        const data = await s3Client.send(new PutObjectCommand(uploadParams))
        console.info(`uploader: uploaded "${filePath}" to S3 bucket "${uploadParams.Bucket}" as "${uploadParams.Key}"`)
        // wait for the stream to finish
        await finished(readStream)
        // delete the local file after successful upload
        await fs.promises.unlink(filePath)
        filesToUpload.splice(filesToUpload.indexOf(filePath), 1)
        console.info(`uploader: successfully uploaded and deleted "${filePath}"`)
        return data
    } catch (err) {
        console.error(`uploader: failed to upload "${filePath}"`, err)
        throw err
    }
}

const buildFileQueue = async () => {
    const fileNames = (await fs.promises.readdir(outputFolder)).filter(file => file.endsWith('.mp4'))
    const filePaths = fileNames.map(fileName => path.join(outputFolder, fileName))
    filesToUpload = [...filePaths]
    console.info(`uploader: ${fileNames.length} files in the queue ${fileNames.join(', ')}`)
}

const uploadOneFromQueue = async () => {
    // pick a random file from the queue (altrough usually there should just be two files max)
    const fileToUpload = filesToUpload[Math.floor(Math.random() * filesToUpload.length)]
    if (!fileToUpload) {
        return
    }
    if (isUploadingInProgress) {
        console.info('uploader: upload already in progress, skipping this cycle')
        return
    }
    isUploadingInProgress = true
    {
        try {
            await upload(fileToUpload)
        } catch (error) {
            console.error(`uploader: failed to upload "${fileToUpload}": `, error)
        }
    }
    isUploadingInProgress = false
    buildFileQueueAndUploadOne()
}

const buildFileQueueAndUploadOne = async () => {
    await buildFileQueue()
    await uploadOneFromQueue()
}

// Run on startup
export default defineNitroPlugin(() => {
    // check s3 credentials
    if (!process.env.AWS_REGION ||
        !process.env.AWS_ACCESS_KEY_ID ||
        !process.env.AWS_SECRET_ACCESS_KEY ||
        !process.env.AWS_S3_BUCKET_NAME) {
        console.error(`uploader: missing env variables for uploading the videos`)
        return
    }
    console.info(`uploader: s3 uploader initialized for bucket "${process.env.AWS_S3_BUCKET_NAME}"`)
    // start loop to upload files every minute
    setInterval(buildFileQueueAndUploadOne, 10 * 1000)
    buildFileQueueAndUploadOne()
})
