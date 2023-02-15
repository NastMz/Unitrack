import { apiRequest } from "../request";
import {Department} from "../../models/interfaces";

/**
 * Sends a GET request to the server to retrieve a list of departments names.
 *
 * @returns {Promise<Department[]>} List of departments.
 */
export async function getDepartments(): Promise<Department[]> {
    // Send a GET request to the '/api/departments' endpoint
    const {data} = await apiRequest("GET", "data/departments/", undefined, false);

    // Return the list of articles from the response data
    return data.departments;
}
