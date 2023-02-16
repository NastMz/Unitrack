import axios from "axios";
import {UpdateStop} from "../../models/interfaces";

const stopCreateAPI = axios.create({
    baseURL: import.meta.env.VITE_API_STOP_UPDATE_URL,
})

/**
 * Update a stop.
 *
 * @param {UpdateStop} stop - The stop to update.
 * @param {number} id - The id of the stop to update.
 */
export const updateStop = async ({stop, id}: { stop: UpdateStop, id: number }) => {
    return await stopCreateAPI.put(`/stop/update/${id}`, stop);
}