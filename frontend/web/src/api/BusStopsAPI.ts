import axios from "axios";

const busStopsAPI = axios.create({
    baseURL: import.meta.env.VITE_API_STOP_URL,
})

/**
 * Get bus stops by stop ids.
 * @param {Array<number>} StopIds - Array of stop ids to get information about.
 * @returns {Promise<BusStop[]>} - Array of bus stops.
 */
export const getBusStops = async (StopIds: Array<number>) => {
    const response = await busStopsAPI.post('/stop/list', {stops: StopIds});
    return response.data.stops;
}