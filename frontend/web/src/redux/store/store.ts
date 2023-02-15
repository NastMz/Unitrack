import {configureStore} from "@reduxjs/toolkit";
import {busStopSlice, timetableSlice} from "../reducers";

/**
 * Store object for the Redux store.
 *
 * This store is configured using the configureStore function from the @reduxjs/toolkit package,
 * and includes the reducers for user, products, categories, subcategories, articles, orders and the shopping cart.
 *
 * @constant
 * @type {ToolkitStore}
 */
export const store = configureStore({
    reducer: {
        busStops: busStopSlice.reducer,
        timetables: timetableSlice.reducer,
    },
});