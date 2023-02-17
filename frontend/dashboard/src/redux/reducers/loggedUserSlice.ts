import {createSlice, PayloadAction} from "@reduxjs/toolkit";

/**
 * Interface for LoggedUserSlice state
 *
 * @interface LoggedUserSliceState
 * @property {string} username - The username of the logged user.
 */
interface LoggedUserSliceState {
    username: string;
}

/**
 * Initial state for the LoggedUserSlice.
 *
 * @constant
 * @type {LoggedUserSliceState}
 */
const initialState: LoggedUserSliceState = {
    username: "",
};

/**
 * LoggedUser slice for the Redux store.
 *
 * This slice includes actions and reducers for handling the state of the logged user in the app.
 *
 * @constant
 * @type {Slice}
 */
export const loggedUserSlice = createSlice({
    name: "loggedUser",
    initialState,
    reducers: {
        /**
         * Action for setting the logged user.
         *
         * @param {LoggedUserSliceState} state - The current state.
         * @param {PayloadAction<string>} action - The action to perform.
         */
        setLoggedUser: (state, action: PayloadAction<string>) => {
            state.username = action.payload;
        }
    }
});

