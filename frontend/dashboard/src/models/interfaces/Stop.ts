import {Timetable} from "./Timetable";

/**
 * Coordinates interface for the Stop model.
 *
 * @interface Coordinates
 * @param {number} lat - The latitude of the stop.
 * @param {number} lng - The longitude of the stop.
 */
export interface Coordinates {
    lat: number;
    lng: number;
}

/**
 * Stop interface for the Stop model.
 *
 * @interface Stop
 * @param {number} id - The id of the stop.
 * @param {string} name - The name of the stop.
 * @param {string} description - The description of the stop.
 * @param {string} image - The image of the stop.
 * @param {Coordinates} coordinates - The coordinates of the stop.
 * @param {Timetable[]} timetables - The timetables of the stop.
 */
export interface Stop {
    id: number;
    name: string;
    description: string;
    image: string;
    coordinates: Coordinates;
    timetables: Timetable[];
}

/**
 * NewStop interface for the Stop model.
 *
 * @interface NewStop
 * @param {string} name - The name of the stop.
 * @param {string} description - The description of the stop.
 * @param {string} image - The image of the stop.
 * @param {number} latitude - The latitude of the stop.
 * @param {number} longitude - The longitude of the stop.
 * @param {number[]} timetableIds - The ids of the timetables of the stop.
 */
export interface NewStop {
    name: string;
    description: string;
    image: string;
    latitude: number;
    longitude: number;
    timetableIds: number[];
}

/**
 * UpdateStop interface for the Stop model.
 *
 * @interface UpdateStop
 * @param {string} name - The name of the stop.
 * @param {string} description - The description of the stop.
 * @param {string} image - The image of the stop.
 * @param {number} latitude - The latitude of the stop.
 * @param {number} longitude - The longitude of the stop.
 */
export interface UpdateStop {
    name: string;
    description: string;
    image: string;
    latitude: number;
    longitude: number;
}