import axios from "axios";
import {UpdateTimetable} from "../../models/interfaces";

const timetableCreateAPI = axios.create({
    baseURL: import.meta.env.VITE_API_USER_UPDATE_URL,
})

/**
 * Update a timetable.
 *
 * @param {UpdateTimetable} timetable - The timetable to update.
 * @param {number} id - The id of the timetable to update.
 */
export const updateTimetable = async ({timetable, id}: { timetable: UpdateTimetable, id: number }) => {
    return await timetableCreateAPI.put(`/timetable/update/${id}`, timetable);
}