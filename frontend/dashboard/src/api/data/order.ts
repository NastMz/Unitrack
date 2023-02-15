import { Order } from "../../models/interfaces";
import {apiRequest} from "../request";
import {OrderProduct} from "../../models/interfaces/Order";

/**
 * Sends a GET request to the server to retrieve a list of orders.
 *
 * @returns {Promise<Order[]>} List of orders.
 */
export async function getOrders(): Promise<Order[]> {
    // Send a GET request to the '/api/orders' endpoint
    const {data} = await apiRequest("GET", "data/orders/");
    // Return the list of orders from the response data
    return data.orders;
}

/**
 * Sends a POST request to the server to create a new order.
 *
 * @param {Product[]} products - List of products to add to the order.
 * @returns {Promise<Order>} The newly created order.
 */
export async function createOrder(products: OrderProduct[]): Promise<Order> {
    // Send a POST request to the '/api/orders' endpoint
    const data = await apiRequest("POST", "/api/data/orders/create/", { products }, false);

    // Return the newly created order from the response data
    return data.Order;
}