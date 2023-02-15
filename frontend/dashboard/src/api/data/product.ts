import { Product } from "../../models/interfaces";
import { apiRequest } from "../request";

/**
 * Sends a GET request to the server to retrieve a list of products.
 *
 * @returns {Promise<Product[]>} List of products.
 */
export async function getProducts(): Promise<Product[]> {
    // Send a GET request to the '/api/products' endpoint
    const {data} = await apiRequest("GET", "data/products/", undefined, false);

    // Return the list of products from the response data
    return data.products;
}
