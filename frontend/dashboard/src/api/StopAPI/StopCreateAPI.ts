import axios from "axios";
import {NewStop} from "../../models/interfaces";

const stopCreateAPI = axios.create({
    baseURL: import.meta.env.VITE_API_STOP_CREATE_URL,
})


/**
 * Create a new stop.
 *
 * @param {NewStop} stop - The stop to create.
 * @returns {Promise<string>} - The message of the response.
 */
export const addStop = async (stop: NewStop) => {
    return await stopCreateAPI.post('/stop/add', stop);
}