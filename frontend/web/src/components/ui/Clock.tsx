import {useEffect} from "react";

/**
 * ClockProps interface.
 *
 * @interface ClockProps
 * @property {Date} time - The current time.
 * @property {(time: Date) => void} setTime - Function to set the current time.
 */
export interface ClockProps {
    time: string;
    setTime: (time: string) => void;
}

/**
 * Clock component.
 *
 * This component shows the hour and minute of the current time.
 * It updates every second.
 *
 * @returns {JSX.Element} - The rendered component.
 */
export const Clock = ({time, setTime}: ClockProps) => {

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return (
        <div
            className={'w-48 h-fit text-white text-center font-medium rounded-full bg-main-600 px-8 py-2 shadow-lg opacity-90'}>
            {time}
        </div>
    )
}