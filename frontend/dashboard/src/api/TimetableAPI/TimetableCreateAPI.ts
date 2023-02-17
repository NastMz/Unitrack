import axios from "axios";
import {NewTimetable} from "../../models/interfaces";
import {logout, validateSession} from "../AuthAPI";

const timetableCreateAPI = axios.create({
    baseURL: import.meta.env.VITE_API_TIMETABLE_CREATE_URL,
})


/**
 * Create a new timetable.
 *
 * @param {NewTimetable} timetable - The timetable to create.
 * @returns {Promise<string>} - The message of the response.
 */
export const addTimetable = async (timetable: NewTimetable) => {

    if (!validateSession()) {
        logout();
    }

    let accessToken = sessionStorage.getItem("access_token")!;

    try {
        return await timetableCreateAPI.post('/timetable/add', timetable, {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });
    } catch (e: any) {
        return e.response;
    }
}