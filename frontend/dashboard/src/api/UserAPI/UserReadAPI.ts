import axios from "axios";
import {logout, validateSession} from "../AuthAPI";

const userReadAPI = axios.create({
    baseURL: import.meta.env.VITE_API_USER_READ_URL,
})

/**
 * Get all users.
 *
 * @returns {Promise<User[]>} - Array of users.
 */
export const getUsers = async () => {

    if (!validateSession()) {
        logout();
    }

    let accessToken = sessionStorage.getItem("access_token")!;

    try {
        return await userReadAPI.get('/user/list', {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });
    } catch (e: any) {
        return e.response;
    }
}