import axios from "axios";
import {NewUser} from "../../models/interfaces";
import {logout, validateSession} from "../AuthAPI";

const userCreateAPI = axios.create({
    baseURL: import.meta.env.VITE_API_USER_CREATE_URL,
})


/**
 * Create a new user.
 *
 * @param {NewUser} user - The user to create.
 * @returns {Promise<string>} - The message of the response.
 */
export const addUser = async (user: NewUser) => {

    if (!validateSession()) {
        logout();
    }

    let accessToken = sessionStorage.getItem("access_token")!;

    try {
        return await userCreateAPI.post('/user/add', user, {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });
    } catch (e: any) {
        return e.response;
    }
}