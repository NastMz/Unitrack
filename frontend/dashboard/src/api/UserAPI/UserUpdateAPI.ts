import axios from "axios";
import {UpdateUser} from "../../models/interfaces";

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
    return await userCreateAPI.put(`/user/update/${id}`, user);
}