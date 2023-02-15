import {apiRequest} from "../request";
import * as CryptoJS from "crypto-js";

/**
 * Validates if the JWT token in the local storage has expired.
 *
 * @returns {boolean} - True if the token has expired, false otherwise.
 */
export function isTokenExpired() {
    let encryptedAccessToken = localStorage.getItem("access_token")!;
    if (!encryptedAccessToken) {
        encryptedAccessToken = sessionStorage.getItem("refresh_token")!;
    }
    const bytes = CryptoJS.AES.decrypt(encryptedAccessToken, import.meta.env.VITE_SECRET_KEY);
    let jwt = CryptoJS.enc.Utf8.stringify(bytes);

    if (!jwt) {
        return true;
    }

    try {
        // Decode the JWT
        const jwtData = JSON.parse(atob(jwt.split(".")[1]));

        // Check if the current time is past the token's expiration time
        const currentTime = Math.round(new Date().getTime() / 1000);
        return currentTime > jwtData.exp;
    } catch (error) {
        console.log(error);
        return true;
    }
}


/**
 * Sends a refresh token request to the server with the given refresh token.
 *
 * @param {string} refreshToken - Refresh token for the refresh request.
 * @returns {Promise<string>} - A promise that resolves with the new JWT token if the request is successful, or rejects with an error message if the request fails.
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
    try {
        // Send a POST request to the '/api/refresh' endpoint with the refresh token
        const data = await apiRequest("POST", "/api/refresh", { refresh: refreshToken }, false);
        if (data.access) {
            // Return the new JWT token
            return data.access;
        } else {
            throw new Error('Error refreshing access token');
        }
    } catch (error) {
        throw error;
    }
}


/**
 * Sends a request to the server to exchange the given id token for an access token and refresh token.
 *
 * @param {string} idToken - The id token to exchange.
 * @returns {Promise<{ accessToken: string, refreshToken: string }>} - A promise that resolves with the access token and refresh token.
 */
export async function exchangeIdTokenForTokens(idToken: string) {
    try {
        // Send a POST request to the '/api/exchange' endpoint with the id token
        const response = await apiRequest("POST", "auth/token/get/", { id_token: idToken }, false);
        if (response.data) {
            // Return the access token and refresh token from the server response
            return { accessToken: response.data.access_token, refreshToken: response.data.refresh_token };
        } else {
            return { accessToken: "", refreshToken: "" };
        }
    } catch (error) {
        return { accessToken: "", refreshToken: "" };
    }
}



