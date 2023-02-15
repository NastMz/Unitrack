/**
 * Exports of functions for getting data from different sources.
 *
 * @module data
 * @exports {function} getArticles - Function to get the list of articles from the data source.
 * @exports {function} getDepartments - Function to get the list of departments from the data source.
 * @exports {function} getCities - Function to get the list of cities from the data source.
 * @exports {function} getCategories - Function to get the list of categories from the data source.
 * @exports {function} getProducts - Function to get the list of products from the data source.
 * @exports {function} getSubcategories - Function to get the list of subcategories from the data source.
 * @exports {function} getOrders - Function to get the list of orders from the data source.
 * @exports {function} createOrder - Function to create a new order.
 */

export { getArticles } from "./article";
export { getDepartments } from "./department";
export { getCities } from "./city";
export { getCategories } from "./category";
export { getProducts } from "./product";
export { getSubcategories } from "./subcategory";
export { getOrders, createOrder } from "./order";
