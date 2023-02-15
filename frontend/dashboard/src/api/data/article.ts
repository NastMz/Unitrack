import { apiRequest } from "../request";
import { Article } from "../../models/interfaces";

/**
 * Sends a GET request to the server to retrieve a list of articles.
 *
 * @returns {Promise<Article[]>} List of articles.
 */
export async function getArticles(): Promise<Article[]> {
    // Send a GET request to the '/api/articles' endpoint
    const {data} = await apiRequest("GET", "data/articles/", undefined, false);

    // Return the list of articles from the response data
    return data.articles;
}
