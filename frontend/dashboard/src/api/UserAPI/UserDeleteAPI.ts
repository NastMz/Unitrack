import axios from "axios";
import {logout, validateSession} from "../AuthAPI";

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

    if (!validateSession()) {
        logout();
    }

    let accessToken = sessionStorage.getItem("access_token")!;

    try {
        return await userCreateAPI.delete(`/user/delete/${id}`, {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });
    } catch (e: any) {
        return e.response;
    }
}