import {AnimatePresence, motion} from "framer-motion";
import {Sidebar} from "../ui";
import {useQuery} from "@tanstack/react-query";
import {getStops, getTimetables, getUsers} from "../../api";
import {Stop, Timetable, User} from "../../models/interfaces";
import {addStop, addTimetable, addUser} from "../../redux/actions";
import {useDispatch} from "react-redux";

/**
 * Interface for the Main component.
 *
 * @param {JSX.Element} page - The page to be rendered.
 * @param {string} title - The title of the page.
 * @param {string} description - The description of the page.
 * @param {string} pageName - The firstName of the page.
 */
interface MainProps {
    page: JSX.Element,
    title: string,
    description: string,
    pageName: string,
}

/**
 * Main component.
 *
 * This component is used to render the pages.
 *
 * @param {MainProps} props - The props for the component.
 * @returns {JSX.Element} - The component.
 */
export const Main = (props: MainProps) => {
    document.title = props.title;


    const dispatch = useDispatch();

    useQuery({
        queryKey: ['apiUsers'],
        queryFn: getUsers,
        onSuccess: (response) => {
            response.data.users.forEach((user: User) => {
                dispatch(addUser(user));
            });
        }
    });

    useQuery({
        queryKey: ['apiTimetables'],
        queryFn: getTimetables,
        onSuccess: (response) => {
            response.data.timetables.forEach((timetable: Timetable) => {
                dispatch(addTimetable(timetable));
            });
        }
    });

    useQuery({
        queryKey: ['apiStops'],
        queryFn: getStops,
        onSuccess: (response) => {
            response.data.stops.forEach((stop: Stop) => {
                dispatch(addStop(stop));
            });
        }
    });

    return (
        <div className={"h-screen max-h-screen w-screen max-w-screen flex"}>
            <Sidebar className={'w-fit'}/>
            <AnimatePresence mode={"wait"}>
                <div className={'w-full h-full overflow-hidden'}>
                    <motion.main
                        initial={{width: 0}}
                        animate={{width: '100%'}}
                        exit={{width: window.innerWidth, transition: {duration: 0.3}}}
                        key={props.pageName}
                        className={'flex flex-col px-12 py-8 w-full h-full overflow-hidden'}
                    >
                        <h2 className={'font-bold text-3xl flex-shrink mb-4'}>{props.pageName}</h2>
                        <p className={'mb-8'}>{props.description}</p>
                        <div
                            className={'flex items-center justify-center rounded-xl h-full overflow-hidden'}
                        >
                            {props.page}
                        </div>

                    </motion.main>
                </div>
            </AnimatePresence>
        </div>
    )
}