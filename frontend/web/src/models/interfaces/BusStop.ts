/**
 * BusStop model.
 *
 * This model is used for the bus stops in the app.
 *
 * @interface BusStop
 * @property {string} id - Bus stop id.
 * @property {string} name - Name of the bus stop.
 * @property {string} description - Details of the bus stop.
 * @property {string} image - Image of the bus stop.
 * @property {Coordinates} coordinates - Coordinates of the bus stop.
 */
export interface BusStop {
    id: number;
    name: string;
    description: string;
    image: string;
    coordinates: Coordinates;
}

/**
 * Coordinates model.
 *
 * This model is used for the coordinates of the bus stops.
 *
 * @interface Coordinates
 * @property {number} lat - Latitude of the bus stop.
 * @property {number} lng - Longitude of the bus stop.
 */
export interface Coordinates {
    lat: number;
    lng: number;
}