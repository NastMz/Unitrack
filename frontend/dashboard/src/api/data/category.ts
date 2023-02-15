import { apiRequest } from "../request";
import { Category } from "../../models/interfaces";

/**
 * Sends a GET request to the server to retrieve a list of categories.
 *
 * @returns {Promise<Category[]>} List of categories.
 */
export async function getCategories(): Promise<Category[]> {
    // Send a GET request to the '/api/categories' endpoint
    const {data} = await apiRequest("GET", "data/categories/", undefined, false);

    // Return the list of categories from the response data
    return data.categories;
}
