import axios from "axios";
import {UpdateTimetable} from "../../models/interfaces";
import {logout, validateSession} from "../AuthAPI";

const timetableCreateAPI = axios.create({
    baseURL: import.meta.env.VITE_API_TIMETABLE_UPDATE_URL,
})

/**
 * Update a timetable.
 *
 * @param {UpdateTimetable} timetable - The timetable to update.
 * @param {number} id - The id of the timetable to update.
 */
export const updateTimetable = async ({timetable, id}: { timetable: UpdateTimetable, id: number }) => {

    if (!validateSession()) {
        logout();
    }

    let accessToken = sessionStorage.getItem("access_token")!;

    try {
        return await timetableCreateAPI.put(`/timetable/update/${id}`, timetable, {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });
    } catch (e: any) {
        return e.response;
    }
}