import {AiOutlineAim} from "react-icons/all";

/**
 * CurrentPositionButtonProps interface.
 *
 * This interface represents the props of the CurrentPositionButton component.
 *
 * @interface CurrentPositionButtonProps
 * @property {(center: boolean) => void} centerMap - Function to center the map.
 */
export interface CurrentPositionButtonProps {
    centerMap: (center: boolean) => void;
}

/**
 * CurrentPositionButton component.
 *
 * This component is the button to center the map in the current position.
 *
 * @param {CurrentPositionButtonProps} props - The props of the component.
 * @returns {JSX.Element} - The rendered component.
 */
export const CurrentPositionButton = ({centerMap}: CurrentPositionButtonProps) => {
    return (
        <div
            className={'cursor-pointer text-main-500 text-4xl h-12 w-12 bg-white rounded-full flex items-center justify-center absolute right-5 bottom-10 z-20 drop-shadow-xl shadow-black'}
            onClick={() => centerMap(true)}
        >
            <AiOutlineAim/>
        </div>
    )
}