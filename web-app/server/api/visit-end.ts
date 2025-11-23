import { exit, EXIT_REASON_CORRECT } from '../visits'

export default defineEventHandler(async (event) => {
    if (!import.meta.dev) {
        return { error: "only available during development" }
    }

    try {
        return await exit(EXIT_REASON_CORRECT)
    } catch (error: any) {
        return { error: error?.message }
    }
})
