import { IsNull } from 'typeorm'
import { getRepository } from '#typeorm'
import { Record } from './entities/record.entity'

export const EXIT_REASON_CORRECT = 'MOTIONLESS'
export const EXIT_REASON_EMERGENCY = 'EMERGENCY'
const EXIT_REASON_UNKNOWN = 'UNKNOWN'

export const getLastUnfinishedVisit = async () => {
    const records = await getRepository(Record)
    return (await records.find({
        where: {
            exitReason: IsNull()
        },
        order: {
            visitStartedAt: 'DESC'
        },
        take: 1
    }))[0]
}

export const getValidVisits = async () => {
    const records = await getRepository(Record)
    return await records.find({
        where:
            [
                { exitReason: EXIT_REASON_CORRECT }
            ]
        ,
        order: {
            visitStartedAt: 'ASC'
        },
        take: 100
    })
}

export const getAllVisits = async () => {
    const records = await getRepository(Record)
    return await records.find({
        order: {
            visitStartedAt: 'DESC'
        },
    })
}

export const finaliseAll = async () => {
    const records = await getRepository(Record)
    const finalised = await records.update({ exitReason: IsNull() }, { exitReason: EXIT_REASON_UNKNOWN })
    console.log('finalised', finalised)
}

export const enter = async () => {
    const records = await getRepository(Record)
    await finaliseAll()
    const record = await records.insert({})
    console.info('enter: the visit is started', record.generatedMaps[0].visitStartedAt)
    return {
        record,
    }
}

export const exit = async (reason: string) => {
    const lastRecord = await getLastUnfinishedVisit()
    if (!lastRecord) {
        throw new Error('no unfinished record found')
    }
    lastRecord.exitReason = reason
    lastRecord.visitFinishedAt = new Date()
    console.info('exit: the visit has ended', lastRecord.visitFinishedAt)
    const records = await getRepository(Record)
    await records.save(lastRecord)
    return lastRecord
}
