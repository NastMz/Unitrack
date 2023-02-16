import axios from "axios";

const stopCreateAPI = axios.create({
    baseURL: import.meta.env.VITE_API_STOP_DELETE_URL,
})

/**
 * Delete a stop.
 *
 * @param {number} id - The id of the stop to delete.
 * @returns {Promise<any>} - The response.
 */
export const deleteStop = async (id: number) => {
    return await stopCreateAPI.delete(`/stop/delete/${id}`);
}