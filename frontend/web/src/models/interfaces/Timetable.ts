/**
 * Timetable interface.
 *
 * This interface is used to define the structure of a timetable.
 *
 * @interface Timetable
 * @property {number} id - The route's id.
 * @property {string} hour - The route's hour.
 */
export interface Timetable {
    id: number;
    hour: string;
}