import {SelectMenu} from "../common";
import {useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {FaMapMarkedAlt} from "react-icons/fa";
import {Clock} from "../ui";
import {BusStop, Timetable} from "../../models/interfaces";
import {selectTimetables} from "../../redux/selectors";

/**
 * Navbar props.
 *
 * @interface NavbarProps
 * @property {Timetable} selectedTimetable - The selected timetable.
 * @property {(timetable: Timetable) => void} setSelectedTimetable - Function to set the selected timetable.
 * @property {(show: boolean) => void} setShowBusStops - Function to set the state of the bus stops.
 */
export interface NavbarProps {
    selectedTimetable: Timetable;
    setSelectedTimetable: (timetable: Timetable) => void;
    setShowBusStops: (show: boolean) => void;
}

/**
 * Navbar component.
 *
 * This component is the navbar of the application.
 *
 * @returns {JSX.Element} - The rendered component.
 */
export const Navbar = ({selectedTimetable, setSelectedTimetable, setShowBusStops}: NavbarProps) => {

    // State for whether the bus stop select menu is showing.
    const [isShowingBusStopMenu, setIsShowingBusStopMenu] = useState(false);

    const timetables = useSelector(selectTimetables);

    const [currentHour, setCurrentHour] = useState('');

    const [timetablesOptions, setTimetablesOptions] = useState<Timetable[]>([]);

    const setOptions = () => {
        const currentDate = new Date();

        const filteredArray = timetables.filter(time => {
            const timeToCompareArray = time.hour.split(":");
            const comparedDate = new Date();
            comparedDate.setHours(Number(timeToCompareArray[0]));
            comparedDate.setMinutes(Number(timeToCompareArray[1]));
            comparedDate.setSeconds(Number(timeToCompareArray[2]));
            return currentDate.getTime() < comparedDate.getTime();
        });

        setTimetablesOptions(filteredArray);

        if (filteredArray.length === 0) {
            setShowBusStops(false);
        } else {
            setShowBusStops(true);
        }


    }

    const setSelectedOption = () => {
        const currentDate = new Date();
        const timeToCompareArray = selectedTimetable.hour.split(":");
        const comparedDate = new Date();
        comparedDate.setHours(Number(timeToCompareArray[0]));
        comparedDate.setMinutes(Number(timeToCompareArray[1]));
        comparedDate.setSeconds(Number(timeToCompareArray[2]));
        if (currentDate.getTime() > comparedDate.getTime() && timetablesOptions.length > 0) {
            setSelectedTimetable(timetablesOptions[0]);
        }
    }

    useEffect(() => {
        setOptions();
        setSelectedOption();
    }, [currentHour]);

    return (
        <nav className={'w-full flex justify-between items-start lg:items-center absolute top-6 px-8 z-20'}>
            <div className={'text-3xl font-bold drop-shadow-md shadow-black ml-8 flex gap-2 items-center'}>
                <FaMapMarkedAlt className={'text-main-600'}/> UniTrack
            </div>
            <div className={'flex flex-col-reverse lg:flex-row gap-4 lg:gap-12 items-center'}>
                {
                    timetablesOptions.length > 0
                        ? (
                        <div onClick={() => setIsShowingBusStopMenu(!isShowingBusStopMenu)}>
                            <SelectMenu
                                options={timetablesOptions}
                                selected={selectedTimetable}
                                setSelected={setSelectedTimetable}
                                isShowing={isShowingBusStopMenu}
                                setIsShowing={setIsShowingBusStopMenu}
                            />
                        </div>
                    )
                        : (
                            <div
                                className={'w-fit h-fit text-white text-center font-medium rounded-full bg-main-600 px-8 py-2 shadow-lg opacity-90'}>
                                No hay horarios disponibles después de las 4 pm.
                            </div>
                        )
                }
                <Clock time={currentHour} setTime={setCurrentHour}/>
            </div>
        </nav>
    )
}