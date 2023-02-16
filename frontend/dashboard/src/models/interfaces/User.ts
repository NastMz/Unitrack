/**
 * Interface for the User model.
 *
 * This interface is used to define the User model.
 *
 * @param {number} id - The id of the user.
 * @param {string} firstName - The firstName of the user.
 * @param {string} lastName - The lastname of the user.
 * @param {string} username - The username of the user.
 */
export interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
}

/**
 * Interface for the NewUser model.
 *
 * This interface is used to define the NewUser model.
 *
 * @param {string} firstName - The firstName of the user.
 * @param {string} lastName - The lastname of the user.
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 */
export interface NewUser {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
}

/**
 * Interface for the UpdateUser model.
 *
 * This interface is used to define the UpdateUser model.
 *
 * @param {string} firstName - The firstName of the user.
 * @param {string} lastName - The lastname of the user.
 * @param {string} username - The username of the user.
 * @param {string} [password] - The password of the user.
 */
export interface UpdateUser {
    firstName: string;
    lastName: string;
    username: string;
    password?: string;
}