import {AES} from "crypto-js";
import { apiRequest } from "../request";
import { exchangeIdTokenForTokens } from "./token";
import {setUser} from "../../redux/actions";
import { User } from "../../models/interfaces";

/**
 * Sends a login request to the server with the given email and password.
 *
 * @param {string} email - Email for the login.
 * @param {string} password - Password for the login.
 * @param {boolean} rememberMe - Whether the user wants to remember the login or not.
 * @returns {Promise<void>} - A promise that resolves when the login request is successful.
 */
export async function login(email: string, password: string, rememberMe: boolean): Promise<boolean> {
    try {
        // Send a POST request to the '/api/login' endpoint with the email and password
        const response = await apiRequest("POST", "auth/login/", { email: email, password: password }, false);

        if (response.data) {
            // Get the id token from the server response
            const idToken = response.data.id_token;

            // Exchange the id token for an access token and refresh token
            const { accessToken, refreshToken } = await exchangeIdTokenForTokens(idToken);

            // encrypt the tokens using AES
            const encryptIdToken = AES.encrypt(idToken, import.meta.env.VITE_SECRET_KEY).toString();
            const encryptAccessToken = AES.encrypt(accessToken, import.meta.env.VITE_SECRET_KEY).toString();
            const encryptRefreshToken = AES.encrypt(refreshToken, import.meta.env.VITE_SECRET_KEY).toString();

            // Store the tokens
            if (rememberMe) {
                localStorage.setItem("id_token", encryptIdToken);
                localStorage.setItem("access_token", encryptAccessToken);
                localStorage.setItem("refresh_token", encryptRefreshToken);
            } else {
                sessionStorage.setItem("id_token", encryptIdToken);
                sessionStorage.setItem("access_token", encryptAccessToken);
                sessionStorage.setItem("refresh_token", encryptRefreshToken);
            }
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

/**
 * This function is called to get the user data from the API.
 *
 * @returns {Promise<User>} - A promise that resolves with the user data.
 */
export async function getUserInfo(): Promise<User> {
    // If the login was successful, get the user data from the API
    const {data} = await apiRequest('GET', `data/user/`);

    return data

}
