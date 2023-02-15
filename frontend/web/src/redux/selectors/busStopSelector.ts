import { store } from "../store";

/**
 * Selector for getting the list of bus stops from the Redux store.
 *
 * @param {ReturnType<typeof store.getState>} state - Current state of the store.
 * @returns {BusStop[]} List of busStops.
 */
export const selectBusStops = (state: ReturnType<typeof store.getState>) =>
  state.busStops.list;
