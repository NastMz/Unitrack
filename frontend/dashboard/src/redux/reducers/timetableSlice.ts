import {Timetable} from "../../models/interfaces";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

/**
 * Interface for TimetableSlice state
 *
 * @interface TimetableSliceState
 * @property {Timetable[]} list - List of timetables.
 */
interface TimetableSliceState {
    list: Timetable[];
}

/**
 * Initial state for the TimetableSlice.
 *
 * @constant
 * @type {TimetableSliceState}
 */
const initialState: TimetableSliceState = {
    list: [],
};

/**
 * Timetable slice for the Redux store.
 *
 * This slice includes actions and reducers for handling the state of timetables in the app,
 * including adding and removing timetables from the list.
 *
 * @constant
 * @type {Slice}
 */
export const timetableSlice = createSlice({
    name: "timetables",
    initialState,
    reducers: {
        /**
         * Action creator for adding a timetable to the list.
         *
         * @param {TimetableSliceState} state - Current state of the slice.
         * @param {PayloadAction<Timetable>} action - Action object with the timetable to be added.
         * @returns {void}
         */
        addTimetable: (state, action: PayloadAction<Timetable>) => {
            state.list = [
                ...state.list.filter((timetable) => timetable.id !== action.payload.id),
                action.payload,
            ];
        },
        /**
         * Reducer for removing a timetable from the list.
         *
         * @param {TimetableSliceState} state - Current state of the slice.
         * @param {PayloadAction<number>} action - Action object with the id of the timetable to be removed.
         * @returns {void}
         */
        removeTimetable: (state, action: PayloadAction<number>) => {
            state.list = state.list.filter(timetable => timetable.id !== action.payload);
        },
        /**
         * Reducer for removing all timetables from the list.
         * @param {TimetableSliceState} state - Current state of the slice.
         */
        removeAllTimetables: (state) => {
            state.list = [];
        }
    }
});

