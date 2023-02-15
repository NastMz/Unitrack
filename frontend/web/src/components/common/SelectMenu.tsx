import {BsCaretDownFill} from "react-icons/bs";
import {useEffect, useRef} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {Timetable} from "../../models/interfaces";

/**
 * Interface for the props of the SelectMenu component.
 *
 * @interface OptionSelectProps
 * @property {Array<Timetable>} options - The options to render.
 * @property {(selected: Timetable) => void} setSelected - The function to set the selected option.
 * @property {Timetable} selected - The selected option.
 * @property {boolean} isShowing - Whether the select menu is showing.
 * @property {(isShowing: boolean) => void} setIsShowing - The function to set whether the select menu is showing.
 * @property {string} [className] - The optional class name to apply to the component.
 * @returns {JSX.Element} - The rendered component.
 */
export interface OptionSelectProps {
    options: Array<Timetable>,
    setSelected: (selected: Timetable) => void,
    selected: Timetable,

    isShowing: boolean,
    setIsShowing: (isShowing: boolean) => void,
    className?: string
}

/**
 * SelectMenu component.
 *
 * This component is used to render a select element with options.
 * The options are passed as an array of strings.
 * The options are rendered as <option> elements.
 * The key of each option is the index of the option in the array.
 *
 * @param {OptionSelectProps} props - The props of the component.
 * @returns {JSX.Element} - The rendered component.
 */
export const SelectMenu = ({options, selected, setSelected, isShowing, setIsShowing, className}: OptionSelectProps) => {

    // Ref for menu
    const menuRef = useRef<any>(null);

    // Hide menu on click in other component
    const hideMenu = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
            setIsShowing(false);
        }
    };
    const handleOptionClick = (option: Timetable) => {
        setSelected(option);
        setIsShowing(false);
    };

    // Activate or deactivate hide cart event listener
    useEffect(() => {
        if (isShowing) {
            document.addEventListener("mousedown", hideMenu);
        } else {
            document.removeEventListener("mousedown", hideMenu);
        }
    }, [isShowing]);

    return (
        <div className={'relative'} ref={menuRef}>
            <div
                className={`relative w-48 h-fit text-white text-center font-medium rounded-full bg-main-600 px-8 py-2 shadow-lg opacity-90 cursor-pointer ${className ? className : ''}`}>
                    {selected.hour}
                    <motion.div
                        animate={{rotate: isShowing ? 180 : 0}}
                        exit={{rotate: isShowing ? 0 : 180}}
                        className={'absolute top-0 right-4 h-full flex items-center justify-center'}
                    >
                        <BsCaretDownFill/>
                    </motion.div>
            </div>
            <AnimatePresence>
                {
                    isShowing && (
                        <motion.div
                            initial={{scale: 0}}
                            animate={{scale: 1}}
                            exit={{scale: 0}}
                            className={`divide-y divide-solid divide-color-white absolute rounded-lg overflow-hidden mt-2 shadow-lg transform origin-top`}
                        >
                            {
                                options.map((option, index) => {
                                    return (
                                        <div
                                            key={option.hour}
                                            className={`${selected === option ? 'bg-main-600' : 'bg-main-400'} w-48 h-fit text-white font-medium px-8 py-2 cursor-pointer hover:bg-main-600`}
                                            onClick={() => handleOptionClick(option)}>
                                            {option.hour}
                                        </div>
                                    )
                                })
                            }
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </div>
    )
}