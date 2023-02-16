import { store } from "../store";

/**
 * Selector for getting the list of users from the Redux store.
 *
 * @param {ReturnType<typeof store.getState>} state - Current state of the store.
 * @returns {User[]} List of users.
 */
export const selectUsers = (state: ReturnType<typeof store.getState>) =>
  state.users.list;
