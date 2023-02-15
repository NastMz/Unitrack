import axios from "axios";

const timetableAPI = axios.create({
    baseURL: import.meta.env.VITE_API_TIMETABLE_URL,
})

/**
 * Get all timetables.
 * @returns {Promise<Timetable[]>} List of timetables.
 */
export const getTimetables = async () => {
    const response = await timetableAPI.get('/timetable/list');
    return response.data.timetables;
}