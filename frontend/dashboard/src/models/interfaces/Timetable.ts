/**
 * Interface for the Timetable model.
 *
 * This interface is used to define the Timetable model.
 *
 * @param {number} id - The id of the timetable.
 * @param {string} hour - The hour of the timetable.
 */
export interface Timetable {
    id: number,
    hour: string
}

/**
 * Interface for the NewTimetable model.
 *
 * This interface is used to define the NewTimetable model.
 *
 * @param {string} hour - The hour of the new timetable.
 */
export interface NewTimetable {
    hour: string
}

/**
 * Interface for the UpdateTimetable model.
 *
 * This interface is used to define the UpdateTimetable model.
 *
 * @param {string} hour - The new hour of the timetable.
 */
export interface UpdateTimetable {
    hour: string
}