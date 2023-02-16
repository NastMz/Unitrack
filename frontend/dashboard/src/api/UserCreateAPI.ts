import axios from "axios";
import {NewUser} from "../models/interfaces";

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
    return await userCreateAPI.post('/user/add', user);
}