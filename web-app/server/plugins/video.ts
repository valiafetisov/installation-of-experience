import type { FfmpegCommand } from 'fluent-ffmpeg'
import fs from 'node:fs'
import ffmpeg from 'fluent-ffmpeg'
import { format } from 'date-fns'

const config = {
    inside: process.env.CAMERA_STREAM_INSIDE,
    outside: process.env.CAMERA_STREAM_OUTSIDE,
} as const
const folder = `./recordings/`

const recordings: { instance: FfmpegCommand; path: string, name: keyof typeof config }[] = []

const start = function (id: string, startDate: Date, name: keyof typeof config) {
    if (!fs.existsSync(folder)) { fs.mkdirSync(folder) }
    const path = `./recordings/from_${format(startDate, 'yyyy-MM-dd_HH-mm-ss')}_id_${id}_${name}.mp4`
    console.info(`video: "${name}": starting to record to "${path}"`)
    const instance = ffmpeg(config[name])
        .format('mp4')
        .toFormat('mp4')
        .videoCodec('copy')
        .outputOptions('-movflags frag_keyframe+empty_moov')
        // .outputOptions('-pix_fmt yuv420p')
        .on('error', (err: any) => {
            if (err?.message?.includes('received signal 2')) return
            console.error(`video: "${name}": recording error:`, err)
        })
        .on('end', () => {
            console.error(`video: "${name}": ffmpeg stream finished`)
        })
        .save(path)
    return { instance, path, name }
}

export const stopAll = function () {
    const recordedPaths = []
    while (recordings.length > 0) {
        const recording = recordings[0]
        console.info(`video: "${recording.name}": stopping`)
        try {
            recording.instance.kill('SIGINT')
            recordedPaths.push(recording.path)
        } catch (error) {
            console.error(`video: "${recording.name}": stop error: `, error)
        }
        recordings.splice(0, 1)
    }
    if (recordedPaths.length > 0) {
        console.info(`video: all streams stopped: "${recordedPaths.join(', ')}"`)
    }
    return recordedPaths
}

export const startAll = function (id: string, startDate: Date) {
    stopAll()
    for (const name of Object.keys(config) as Array<keyof typeof config>) {
        if (!config[name]) continue
        try {
            recordings.push(start(id, startDate, name))
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
