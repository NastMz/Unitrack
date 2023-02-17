import axios from "axios";
import {logout, validateSession} from "../AuthAPI";

const timetableReadAPI = axios.create({
    baseURL: import.meta.env.VITE_API_TIMETABLE_READ_URL,
})

/**
 * Get all timetables.
 *
 * @returns {Promise<Timetable[]>} - Array of timetables.
 */
export const getTimetables = async () => {

    if (!validateSession()) {
        logout();
    }

    let accessToken = sessionStorage.getItem("access_token")!;

    try {
        return await timetableReadAPI.get('/timetable/list', {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });
    } catch (e: any) {
        return e.response;
    }
}