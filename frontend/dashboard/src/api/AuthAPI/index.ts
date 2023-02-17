/**
 * Exports of functions for interacting with the client.
 *
 * @module client
 * @exports {function} login - Function to log in the user.
 * @exports {function} logout - Function to log out the user.
 * @exports {function} isTokenExpired - Function to validate if JWT token has expired.
 * @exports {function} validateSession - Function to validate if the user is logged in.
 */

export {login} from "./Login";
export {logout} from "./logout";
export {validateSession} from "./session";
export {isTokenExpired} from "./token";
