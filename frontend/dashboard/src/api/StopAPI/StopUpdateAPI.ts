import axios from "axios";
import {UpdateStop} from "../../models/interfaces";
import {logout, validateSession} from "../AuthAPI";

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

    if (!validateSession()) {
        logout();
    }

    let accessToken = sessionStorage.getItem("access_token")!;

    try {
        return await stopCreateAPI.put(`/stop/update/${id}`, stop, {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });
    } catch (e: any) {
        return e.response;
    }
}