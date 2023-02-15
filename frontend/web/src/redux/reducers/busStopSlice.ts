import { BusStop } from "../../models/interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Interface for BusStopSlice state
 *
 * @interface BusStopSliceState
 * @property {BusStop[]} list - List of bus stops.
 */
interface BusStopSliceState {
    list: BusStop[];
}

/**
* Initial state for the BusStopSlice.
*
* @constant
* @type {BusStopSliceState}
*/
const initialState: BusStopSliceState = {
    list: [],
};

/**
* BusStop slice for the Redux store.
*
* This slice includes actions and reducers for handling the state of busStops in the app,
* including adding and removing busStops from the list.
*
* @constant
* @type {Slice}
*/
export const busStopSlice = createSlice({
    name: "busStops",
    initialState,
    reducers: {
        /**
         * Action creator for adding a busStop to the list.
         *
         * @param {BusStopSliceState} state - Current state of the slice.
         * @param {PayloadAction<BusStop>} action - Action object with the id to be added.
         * @returns {void}
         */
        addBusStop: (state, action: PayloadAction<BusStop>) => {
                state.list = [
                    ...state.list.filter((busStop) => busStop.id !== action.payload.id),
                    action.payload,
                    ];
                },
        /**
         * Reducer for removing a busStop from the list.
         *
         * @param {BusStopSliceState} state - Current state of the slice.
         * @param {PayloadAction<number>} action - Action object with the id of the id to be removed.
         * @returns {void}
         */
        removeBusStop: (state, action: PayloadAction<number>) => {
            state.list = state.list.filter(busStop => busStop.id !== action.payload);
        },
        /**
         * Reducer for removing all busStops from the list.
         * @param {BusStopSliceState} state - Current state of the slice.
         */
        removeAllBusStops: (state) => {
            state.list = [];
        }
    }
});

