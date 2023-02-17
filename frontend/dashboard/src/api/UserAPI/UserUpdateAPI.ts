import axios from "axios";
import {UpdateUser} from "../../models/interfaces";
import {logout, validateSession} from "../AuthAPI";

const userCreateAPI = axios.create({
    baseURL: import.meta.env.VITE_API_USER_UPDATE_URL,
})

/**
 * Update a user.
 *
 * @param {UpdateUser} user - The user to update.
 * @param {number} id - The id of the user to update.
 */
export const updateUser = async ({user, id}:{user: UpdateUser, id:number}) => {

    if (!validateSession()) {
        logout();
    }

    let accessToken = sessionStorage.getItem("access_token")!;

    try {
        return await userCreateAPI.put(`/user/update/${id}`, user, {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });
    } catch (e: any) {
        return e.response;
    }
}