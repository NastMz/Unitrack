import axios from "axios";

const userReadAPI = axios.create({
    baseURL: import.meta.env.VITE_API_USER_READ_URL,
})

/**
 * Get all users.
 *
 * @returns {Promise<User[]>} - Array of users.
 */
export const getUsers = async () => {
    return await userReadAPI.get('/user/list');
}