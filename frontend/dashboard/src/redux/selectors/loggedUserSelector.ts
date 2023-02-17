import {store} from "../store";

/**
 * Selector for getting the logged user from the Redux store.
 * @param {ReturnType<typeof store.getState>} state - Current state of the store.
 * @returns {string} The logged user's username.
 */
export const selectLoggedUser = (state: ReturnType<typeof store.getState>) => state.loggedUser.username;