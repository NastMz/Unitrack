import axios from "axios";

const timetableReadAPI = axios.create({
    baseURL: import.meta.env.VITE_API_TIMETABLE_READ_URL,
})

/**
 * Get all timetables.
 *
 * @returns {Promise<Timetable[]>} - Array of timetables.
 */
export const getTimetables = async () => {
    return await timetableReadAPI.get('/timetable/list');
}