import {store} from "../store";

/**
 * Selector for getting the list of stops from the Redux store.
 *
 * @param {ReturnType<typeof store.getState>} state - Current state of the store.
 * @returns {Stop[]} List of stops.
 */
export const selectStops = (state: ReturnType<typeof store.getState>) =>
    state.stops.list;
