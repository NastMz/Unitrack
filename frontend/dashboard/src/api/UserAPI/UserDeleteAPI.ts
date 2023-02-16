import axios from "axios";

const userCreateAPI = axios.create({
    baseURL: import.meta.env.VITE_API_USER_DELETE_URL,
})

/**
 * Delete a user.
 *
 * @param {number} id - The id of the user to delete.
 * @returns {Promise<string>} - The message of the response.
 */
export const deleteUser = async (id: number) => {
    return await userCreateAPI.delete(`/user/delete/${id}`);
}