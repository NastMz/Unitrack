import { apiRequest } from "../request";
import {City} from "../../models/interfaces";

/**
 * Sends a GET request to the server to retrieve a list of cities names.
 *
 * @returns {Promise<City[]>} List of cities.
 */
export async function getCities(): Promise<City[]> {
    // Send a GET request to the '/api/cities' endpoint
    const {data} = await apiRequest("GET", "data/cities/", undefined, false);

    // Return the list of articles from the response data
    return data;
}
