import { busStopSlice } from "../reducers";

/**
 * Exported actions for the bus stop slice of the Redux store.
 *
 * @constant
 * @type {object}
 * @property {function} addBusStop - Action creator for adding a bus stop to the list.
 * @property {function} removeBusStop - Action creator for removing a bus stop from the list.
 * @property {function} removeAllBusStops - Action creator for removing all bus stops from the list.
 */
export const { addBusStop, removeBusStop, removeAllBusStops } = busStopSlice.actions;
