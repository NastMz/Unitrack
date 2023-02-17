import axios from "axios";

/**
 * Validates if the JWT token in the local storage has expired.
 *
 * @returns {boolean} - True if the token has expired, false otherwise.
 */
export function isTokenExpired() {
    let jwt = sessionStorage.getItem("access_token")!;

    if (!jwt) {
        return true;
    }

    try {
        // Decode the JWT
        const [header, payload, signature] = jwt.split(".");
        const decodedPayload = JSON.parse(atob(payload));

        // Get the expiry date
        const exp = decodedPayload.exp;
        const expiryDate = new Date(exp * 1000);

        // Check if the current time is past the token's expiration time
        const currentTime = new Date();

        return currentTime > expiryDate;
    } catch (error) {
        return true;
    }
}

const tokenAPI = axios.create({
    baseURL: import.meta.env.VITE_API_REFRESH_TOKEN_URL,
})

export const refreshToken = async () => {
    let refreshToken = sessionStorage.getItem("refresh_token")!;

    if (!refreshToken) {
        return null;
    }

    try {
        return await tokenAPI.post('/refresh-token', null, {
            headers: {
                Authorization: 'Bearer ' + refreshToken
            }
        });
    } catch (e: any) {
        return e.response;
    }
}

