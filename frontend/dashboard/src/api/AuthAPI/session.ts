import {isTokenExpired, refreshToken} from "./token";

/**
 * Determines if the user is logged in by checking if the JWT token exists in the local storage.
 *
 * @returns {boolean} - True if the user is logged in, false otherwise.
 */
export function validateSession() {
    let jwtToken = sessionStorage.getItem("access_token");

    if (!jwtToken) {
        return false;
    } else if (isTokenExpired()) {
        let response = refreshToken();
        response.then((res) => {
            if (res) {
                if (res.status === 200) {
                    sessionStorage.setItem("access_token", res.data.access_token);
                }
            } else {
                return false;
            }
        }).catch((error) => {
            return false;
        });
    }

    return true;
}