import { apiRequest } from "../request";
import { Subcategory } from "../../models/interfaces";

/**
 * Sends a GET request to the server to retrieve a list of subcategories.
 *
 * @returns {Promise<Subcategory[]>} List of subcategories.
 */
export async function getSubcategories(): Promise<Subcategory[]> {
    // Send a GET request to the '/api/subcategories' endpoint
    const {data} = await apiRequest("GET", "data/subcategories/", undefined, false);

    // Return the list of subcategories from the response data
    return data.subcategories;
}
