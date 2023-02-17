import axios from "axios";
import {logout, validateSession} from "../AuthAPI";

const stopReadAPI = axios.create({
    baseURL: import.meta.env.VITE_API_STOP_READ_URL,
})

/**
 * Get all stops.
 *
 * @returns {Promise<Stop[]>} - Array of stops.
 */
export const getStops = async () => {

    if (!validateSession()) {
        logout();
    }

    let accessToken = sessionStorage.getItem("access_token")!;

    try {
        return await stopReadAPI.get('/stop/list', {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });
    } catch (e: any) {
        return e.response;
    }
}