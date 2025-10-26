import { IsNull } from 'typeorm'
import { getRepository } from '#typeorm'
import { Record } from './entities/record.entity'
import { startAll, stopAll } from './plugins/video'

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
    const [visits, total] = await records.findAndCount({
        where: {
            exitReason: EXIT_REASON_CORRECT,
            // visitStartedAt: MoreThanOrEqual(startOfToday()) // only return records from today
        },
        order: {
            visitStartedAt: 'ASC'
        },
        take: 100
    })
    return { visits, total }
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
    if (finalised.affected && finalised.affected > 0) {
        console.log('finalised records:', finalised.affected)
    }
}

export const enter = async () => {
    const records = await getRepository(Record)
    await finaliseAll()
    const result = await records.insert({})
    const record = result.generatedMaps[0]
    startAll(record.id, record.visitStartedAt)
    console.info('enter: the visit is started', record.visitStartedAt)
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
    stopAll()
    return lastRecord
}
