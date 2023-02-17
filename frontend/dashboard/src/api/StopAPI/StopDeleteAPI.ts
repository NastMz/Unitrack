import axios from "axios";
import {logout, validateSession} from "../AuthAPI";

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

    if (!validateSession()) {
        logout();
    }

    let accessToken = sessionStorage.getItem("access_token")!;

    try {
        return await stopCreateAPI.delete(`/stop/delete/${id}`, {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });
    } catch (e: any) {
        return e.response;
    }
}