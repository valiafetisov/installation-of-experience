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
    const results = await getValidVisits()
    const last = await getLastUnfinishedVisit()
    if (last) {
        results.visits.push(last)
        results.total++
    }
    return results
})
