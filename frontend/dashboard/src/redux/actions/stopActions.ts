import {stopSlice} from "../reducers";

/**
 * Exported actions for the stop slice of the Redux store.
 *
 * @constant
 * @type {object}
 * @property {function} addStop - Action creator for adding a stop to the list.
 * @property {function} removeStop - Action creator for removing a stop from the list.
 * @property {function} removeAllStops - Action creator for removing all stops from the list.
 */
export const {addStop, removeStop, removeAllStops} = stopSlice.actions;
