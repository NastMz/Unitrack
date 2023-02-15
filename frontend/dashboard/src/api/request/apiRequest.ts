import axios from "axios";
import * as CryptoJS from "crypto-js";
import {isTokenExpired} from "../client";

/**
 * Sends an API request with the given method, URL and data.
 *
 * @param {'GET'|'POST'|'PUT'|'DELETE'} method - HTTP method for the request.
 * @param {string} url - URL for the request.
 * @param {any} [data] - Data to be sent in the request (optional).
 * @param {boolean} useAuth - Whether to use the JWT token for authentication (Default true).
 * @param {'application/json' | 'multipart/form-data' | 'application/x-www-form-urlencoded'} contentType - Content type for the request (Default 'application/json').
 * @returns {Promise<any>} Response data.
 */
export async function apiRequest(
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    data?: any,
    useAuth = true,
    contentType: "application/json" | "multipart/form-data" | "application/x-www-form-urlencoded" = "application/json"
): Promise<any> {

    const apiUrl = import.meta.env.VITE_API_URL;
    // Check if the JWT token has expired
    let accessToken = "";
    let storageType: string = "localStorage";

// check if there is an access_token in localstorage, if true, decrypt it
    if (localStorage.getItem("access_token")) {
        let encryptedAccessToken = localStorage.getItem("access_token")!;
        const bytes = CryptoJS.AES.decrypt(encryptedAccessToken, import.meta.env.VITE_SECRET_KEY);
        accessToken = CryptoJS.enc.Utf8.stringify(bytes);
    } else if (sessionStorage.getItem("access_token")) {
        let encryptedAccessToken = sessionStorage.getItem("access_token")!;
        const bytes = CryptoJS.AES.decrypt(encryptedAccessToken, import.meta.env.VITE_SECRET_KEY);
        accessToken = CryptoJS.enc.Utf8.stringify(bytes);
        storageType = "sessionStorage";
    }

    if (accessToken) {
        if (isTokenExpired()) {
            // Refresh the JWT token
            let encryptedRefreshToken = localStorage.getItem("refresh_token")!;
            if (!encryptedRefreshToken) {
                encryptedRefreshToken = sessionStorage.getItem("refresh_token")!;
            }
            const bytes = CryptoJS.AES.decrypt(encryptedRefreshToken, import.meta.env.VITE_SECRET_KEY);
            let refreshToken = CryptoJS.enc.Utf8.stringify(bytes);
            const refreshData = await axios.post(apiUrl+"auth/token/refresh/", {refresh: refreshToken});
            if (refreshData.data.success) {
                accessToken = refreshData.data.token;

                let encryptAccessToken = CryptoJS.AES.encrypt(accessToken, import.meta.env.VITE_SECRET_KEY).toString();
                // Updates the JWT token in the storage
                if (storageType === "localStorage") {
                    localStorage.setItem("access_token", encryptAccessToken);
                } else {
                    sessionStorage.setItem("access_token", encryptAccessToken);
                }
            } else {
                // If the refresh token has expired or is invalid, delete the tokens from storage
                localStorage.removeItem("id_token");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                sessionStorage.removeItem("id_token");
                sessionStorage.removeItem("access_token");
                sessionStorage.removeItem("refresh_token");
                return;
            }
        }
    }

    // Set the options for the request
    url = apiUrl + url;
    const options: any = {
        method,
        url,
        data,
        headers: {
            "Content-Type": contentType
        },
    };

    // Add the JWT token to the headers if authentication is enabled
    if (useAuth) {
        if (accessToken) {
            options.headers.Authorization = `Bearer ${accessToken}`;
        } else {
            return;
        }
    }
    // Send the request and return the response data
    try {
        return await axios(options);
    } catch (error: any) {
        return error.response;
    }
}
