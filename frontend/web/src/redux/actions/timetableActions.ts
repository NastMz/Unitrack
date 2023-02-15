import {timetableSlice} from "../reducers";

/**
 * Exported actions for the timetable slice of the Redux store.
 *
 * @constant
 * @type {object}
 * @property {function} addTimetable - Action creator for adding a timetable to the list.
 * @property {function} removeTimetable - Action creator for removing a timetable from the list.
 * @property {function} removeAllTimetables - Action creator for removing all timetables from the list.
 */
export const {addTimetable, removeTimetable, removeAllTimetables} = timetableSlice.actions;
