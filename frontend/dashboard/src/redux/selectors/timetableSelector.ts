import {store} from "../store";

/**
 * Selector for getting the list of timetables from the Redux store.
 *
 * @param {ReturnType<typeof store.getState>} state - Current state of the store.
 * @returns {Timetable[]} List of timetables.
 */
export const selectTimetables = (state: ReturnType<typeof store.getState>) =>
    state.timetables.list;
