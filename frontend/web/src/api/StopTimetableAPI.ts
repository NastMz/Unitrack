import axios from "axios";

const stopTimetableAPI = axios.create({
    baseURL: import.meta.env.VITE_API_STOP_TIMETABLE_URL,
})

/**
 * Get all stops by timetable id.
 * @param {number} timetableId - Timetable id to get stops.
 * @returns {Promise<BusStop[]>} - Promise that resolves to an array of bus stops.
 */
export const getStopsByTimetable = async (timetableId: number) => {
    const response = await stopTimetableAPI.get(`/api/stop-timetable/${timetableId}`);
    return response.data.stops;
}