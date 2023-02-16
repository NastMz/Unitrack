import {Stop} from "../../models/interfaces";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

/**
 * Interface for StopSlice state
 *
 * @interface StopSliceState
 * @property {Stop[]} list - List of stops.
 */
interface StopSliceState {
    list: Stop[];
}

/**
 * Initial state for the StopSlice.
 *
 * @constant
 * @type {StopSliceState}
 */
const initialState: StopSliceState = {
    list: [],
};

/**
 * Stop slice for the Redux store.
 *
 * This slice includes actions and reducers for handling the state of stops in the app,
 * including adding and removing stops from the list.
 *
 * @constant
 * @type {Slice}
 */
export const stopSlice = createSlice({
    name: "stops",
    initialState,
    reducers: {
        /**
         * Action creator for adding a stop to the list.
         *
         * @param {StopSliceState} state - Current state of the slice.
         * @param {PayloadAction<Stop>} action - Action object with the stop to be added.
         * @returns {void}
         */
        addStop: (state, action: PayloadAction<Stop>) => {
            state.list = [
                ...state.list.filter((stop) => stop.id !== action.payload.id),
                action.payload,
            ];
        },
        /**
         * Reducer for removing a stop from the list.
         *
         * @param {StopSliceState} state - Current state of the slice.
         * @param {PayloadAction<number>} action - Action object with the id of the stop to be removed.
         * @returns {void}
         */
        removeStop: (state, action: PayloadAction<number>) => {
            state.list = state.list.filter(stop => stop.id !== action.payload);
        },
        /**
         * Reducer for removing all stops from the list.
         * @param {StopSliceState} state - Current state of the slice.
         */
        removeAllStops: (state) => {
            state.list = [];
        }
    }
});

