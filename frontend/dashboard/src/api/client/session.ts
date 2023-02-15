import { isTokenExpired, refreshAccessToken } from "./token";
import * as CryptoJS from "crypto-js";

/**
 * Determines if the user is logged in by checking if the JWT token exists in the local storage.
 *
 * @returns {boolean} - True if the user is logged in, false otherwise.
 */
export function isLoggedIn(): boolean {
    let jwtToken = localStorage.getItem("id_token");
    if (!jwtToken) {
        jwtToken = sessionStorage.getItem("id_token");
    }
    return jwtToken !== null;
}


/**
 * Validates if the user is logged in and the JWT token is valid.
 * If the token has expired, it tries to refresh it with the refresh token.
 *
 * @returns {Promise<boolean>} - A promise that resolves with true if the user is logged in and the token is valid, false otherwise.
 */
export async function validateSession(): Promise<boolean> {
    // If the user is not logged in, return false
    if (!isLoggedIn()) {
        return false;
    }

    // If the refresh token exists and the JWT token has expired, try to refresh the JWT token
    let encryptedRefreshToken = localStorage.getItem("refresh_token")!;
    if (!encryptedRefreshToken) {
        encryptedRefreshToken = sessionStorage.getItem("refresh_token")!;
    }
    const bytes = CryptoJS.AES.decrypt(encryptedRefreshToken, import.meta.env.VITE_SECRET_KEY);
    let refreshTokenValue = CryptoJS.enc.Utf8.stringify(bytes);

    if (isTokenExpired()) {
        if (refreshTokenValue !== null) {
            try {
                const newJwt = await refreshAccessToken(refreshTokenValue);
                const encryptAccessToken = CryptoJS.AES.encrypt(newJwt, import.meta.env.VITE_SECRET_KEY).toString();
                if (!localStorage.getItem("access_token")) {
                    sessionStorage.setItem("access_token", encryptAccessToken);
                } else {
                    localStorage.setItem("access_token", encryptAccessToken);
                }
                return true;
            } catch (error) {
                return false;
            }
        } else {
            return false;
        }
    }

    // If the user is logged in and the JWT token is valid, return true
    return true;
}