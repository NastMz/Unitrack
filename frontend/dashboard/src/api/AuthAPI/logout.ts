/**
 * Logs out the user by deleting the JWT token and refresh token from the local storage and redirecting the user to the login page.
 */
export function logout() {
    // Delete the tokens from the session storage
    sessionStorage.removeItem("id_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");

    // Redirect the user to the login page
    window.location.href = "/login";
}

