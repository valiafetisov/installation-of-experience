import type { FfmpegCommand } from 'fluent-ffmpeg'
import fs from 'node:fs'
import path from 'node:path'
import ffmpeg from 'fluent-ffmpeg'
import { format } from 'date-fns'
import { buildFileQueueAndUpload, recordingsFolder } from './videoUploader'

const config = {
    inside: process.env.CAMERA_STREAM_INSIDE,
    outside: process.env.CAMERA_STREAM_OUTSIDE,
} as const
const recordings: { instance: FfmpegCommand; filePath: string, cameraName: keyof typeof config }[] = []

const start = function (id: string, startDate: Date, cameraName: keyof typeof config) {
    if (!fs.existsSync(recordingsFolder)) { fs.mkdirSync(recordingsFolder) }
    const fileName = `from_${format(startDate, 'yyyy-MM-dd_HH-mm-ss')}_id_${id}_${cameraName}.mp4`
    const filePath = path.join(recordingsFolder, fileName)
    console.info(`video: "${cameraName}": starting to record to "${filePath}"`)
    const instance = ffmpeg(config[cameraName])
        .format('mp4')
        .toFormat('mp4')
        .videoCodec('copy')
        .outputOptions('-movflags frag_keyframe+empty_moov')
        // .outputOptions('-pix_fmt yuv420p')
        .on('error', (err: any) => {
            if (err?.message?.includes('received signal 2')) return
            console.error(`video: "${cameraName}": recording error:`, err)
        })
        .on('end', () => {
            console.error(`video: "${cameraName}": ffmpeg stream finished`)
        })
        .save(filePath)
    return { instance, filePath, cameraName }
}

export const stopAll = function () {
    const recordedPaths = []
    while (recordings.length > 0) {
        const recording = recordings[0]
        console.info(`video: "${recording.cameraName}": stopping`)
        try {
            recording.instance.kill('SIGINT')
            recordedPaths.push(recording.filePath)
        } catch (error) {
            console.error(`video: "${recording.cameraName}": stop error: `, error)
        }
        recordings.splice(0, 1)
    }
    if (recordedPaths.length > 0) {
        console.info(`video: all streams stopped: "${recordedPaths.join(', ')}"`)
    }
    buildFileQueueAndUpload()
    return recordedPaths
}

export const startAll = function (id: string, startDate: Date) {
    stopAll()
    for (const cameraName of Object.keys(config) as Array<keyof typeof config>) {
        if (!config[cameraName]) continue
        try {
            recordings.push(start(id, startDate, cameraName))
        } catch (error) {
            console.error(`video: "${name}": start error`, error)
        }
    }
}

// Run on startup
export default defineNitroPlugin(() => {
    for (const name of Object.keys(config) as Array<keyof typeof config>) {
        if (!config[name]) {
            console.error(`video: missing env variable for the "${name}" stream, recording will not work`)
        }
    }
})
