import axios from "axios";

const loginAPI = axios.create({
    baseURL: import.meta.env.VITE_API_LOGIN_URL,
})


/**
 * Sends a login request to the server with the given email and password.
 *
 * @returns {Promise<any>} - The response.
 * @param {Credentials} credentials - The credentials to send.
 */
export const login = async (credentials: Credentials) => {
    return await loginAPI.post('/login', credentials);
}

/**
 * Interface for the credentials to send.
 *
 * @interface Credentials
 * @property {string} username - The username.
 * @property {string} password - The password.
 */
export interface Credentials {
    username: string;
    password: string;
}
