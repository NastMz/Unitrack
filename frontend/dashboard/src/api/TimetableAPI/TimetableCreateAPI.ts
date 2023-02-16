import axios from "axios";
import {NewTimetable} from "../../models/interfaces";

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
    return await timetableCreateAPI.post('/timetable/add', timetable);
}