import axios from "axios";

const stopReadAPI = axios.create({
    baseURL: import.meta.env.VITE_API_STOP_READ_URL,
})

/**
 * Get all stops.
 *
 * @returns {Promise<Stop[]>} - Array of stops.
 */
export const getStops = async () => {
    return await stopReadAPI.get('/stop/list');
}