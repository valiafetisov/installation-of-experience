import { getAllVisits, getLastUnfinishedVisit, getValidVisits } from '../visits'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    if (query.all) {
        if (!import.meta.dev) {
            return { error: "only available during development" }
        }
        return {
            visits: await getAllVisits(),
        }
    }
    return {
        visits: await getValidVisits(),
        last: await getLastUnfinishedVisit(),
    }
})
