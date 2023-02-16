import axios from "axios";

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
    return await timetableCreateAPI.delete(`/timetable/delete/${id}`);
}