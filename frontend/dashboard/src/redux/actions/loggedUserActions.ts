import {loggedUserSlice} from "../reducers";

/**
 * Exported actions for the logged user slice of the Redux store.
 *
 * @constant
 * @type {object}
 * @property {function} setLoggedUser - Action to set the logged user.
 */
export const {setLoggedUser} = loggedUserSlice.actions;
