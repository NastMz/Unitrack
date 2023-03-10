import axios from "axios";
import {logout, validateSession} from "../AuthAPI";

const timetableCreateAPI = axios.create({
    baseURL: import.meta.env.VITE_API_TIMETABLE_DELETE_URL,
})

/**
 * Delete a timetable.
 *
 * @param {number} id - The id of the timetable to delete.
 * @returns {Promise<any>} - The response.
 */
export const deleteTimetable = async (id: number) => {

    if (!validateSession()) {
        logout();
    }

    let accessToken = sessionStorage.getItem("access_token")!;

    try {
        return await timetableCreateAPI.delete(`/timetable/delete/${id}`, {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });
    } catch (e: any) {
        return e.response;
    }
}