import { enter } from '../visits'

export default defineEventHandler(async (event) => {
    if (!import.meta.dev) {
        return { error: "only available during development" }
    }

    return await enter()
})
