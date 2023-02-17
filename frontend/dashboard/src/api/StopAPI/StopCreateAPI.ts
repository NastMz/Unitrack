import axios from "axios";
import {NewStop} from "../../models/interfaces";
import {logout, validateSession} from "../AuthAPI";

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

    if (!validateSession()) {
        logout();
    }

    let accessToken = sessionStorage.getItem("access_token")!;

    try {
        return await stopCreateAPI.post('/stop/add', stop, {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });
    } catch (e: any) {
        return e.response;
    }
}