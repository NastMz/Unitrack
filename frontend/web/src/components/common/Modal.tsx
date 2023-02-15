import React from "react";
import {motion} from "framer-motion";
import {AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineInfoCircle, AiOutlineWarning} from 'react-icons/ai';

/**
 * Variants for animating the modal.
 *
 * @type {import('framer-motion').Variants}
 */
const modalVariants = {
    open: {scale: 1},
    closed: {scale: 0},
};

/**
 * Variants for animating the background.
 *
 * @type {import('framer-motion').Variants}
 */
const backgroundVariants = {
    open: {opacity: 1},
    closed: {opacity: 0},
};


/**
 * Interface for Modal component props.
 *
 * @interface ModalProps
 * @property {string} title - The title of the modal.
 * @property {string} message - The message of the modal.
 * @property {string} buttonText - The text of the button.
 * @property {boolean} isOpen - Whether the modal is open or closed.
 * @property {() => void} onButtonClick - The function to call when the button is clicked.
 * @property {'error' | 'warning' | 'info' | 'success'} type - The type of modal to display.
 */
interface ModalProps {
    title: string;
    message: string;
    buttonText: string;
    isOpen: boolean;
    onButtonClick: () => void;
    type: 'error' | 'warning' | 'info' | 'success';
}


/**
 * Modal component.
 *
 * This component displays a modal with a title, message, and button.
 *
 * @param {ModalProps} props - Props for the component.
 * @returns {ReactNode} The rendered component.
 */
export const Modal: React.FC<ModalProps> = ({
                                                title,
                                                message,
                                                buttonText,
                                                isOpen,
                                                onButtonClick,
                                                type,
                                            }) => {

    let icon;
    let textColor;

    switch (type) {
        case 'error':
            icon = <AiOutlineCloseCircle size={48}/>;
            textColor = 'text-red-600';
            break;
        case 'warning':
            icon = <AiOutlineWarning size={48}/>;
            textColor = 'text-yellow-600';
            break;
        case 'info':
            icon = <AiOutlineInfoCircle size={48}/>;
            textColor = 'text-blue-600';
        case 'success':
            icon = <AiOutlineCheckCircle size={48}/>;
            textColor = 'text-green-600';
            break;
        default:
            icon = null;
            textColor = '';
    }

    return (
        <motion.div
            initial="closed"
            animate={isOpen ? 'open' : 'closed'}
            exit="closed"
            variants={backgroundVariants}
            className={`${
                isOpen ? 'block' : 'hidden'
            } absolute inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center`}
        >
            <motion.div
                initial="closed"
                animate={isOpen ? 'open' : 'closed'}
                exit="closed"
                transition={{delay: 0.2}}
                variants={modalVariants}
                className="relative w-96 p-4 mx-auto"
            >
                <div className="relative rounded-lg shadow-lg bg-white overflow-x-hidden">
                    <div className={`flex items-center px-4 py-4 ${textColor}`}>
                        {icon}
                        <div className="ml-4 font-semibold text-lg leading-tight">{title}</div>
                    </div>
                    <div className="px-4 py-4 text-gray-700 whitespace-pre-line">{message}</div>
                    <div className="px-4 py-4 bg-gray-100 flex justify-center">
                        <button
                            className="ml-4 px-4 py-2 rounded-md text-white text-sm font-semibold bg-main-600 hover:bg-main-400 focus:outline-none focus:bg-main-400"
                            onClick={onButtonClick}
                        >
                            {buttonText}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

