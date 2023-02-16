import { userSlice } from "../reducers";

/**
 * Exported actions for the user slice of the Redux store.
 *
 * @constant
 * @type {object}
 * @property {function} addUser - Action creator for adding a user to the list.
 * @property {function} removeUser - Action creator for removing a user from the list.
 * @property {function} removeAllUsers - Action creator for removing all users from the list.
 */
export const { addUser, removeUser, removeAllUsers } = userSlice.actions;
