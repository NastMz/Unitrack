import React, {MouseEventHandler, useRef} from "react";
import {motion} from "framer-motion";
import { AiOutlineInfoCircle, AiOutlineWarning, AiOutlineCloseCircle, AiOutlineCheckCircle } from 'react-icons/ai';

/**
 * Variants for animating the modal.
 *
 * @type {import('framer-motion').Variants}
 */
const modalVariants = {
    open: { scale: 1 },
    closed: { scale: 0 },
};

/**
 * Variants for animating the background.
 *
 * @type {import('framer-motion').Variants}
 */
const backgroundVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
};


/**
 * Interface for Modal component props.
 *
 * @interface LoaderModalProps
 * @property {string} message - The message of the modal.
 * @property {boolean} isOpen - Whether the modal is open or closed.
 */
interface LoaderModalProps {
    isOpen: boolean;
    message: string;
}


/**
 * LoaderModal component.
 *
 * This component displays a modal with a loading spinner.
 *
 * @param {LoaderModalProps} props - Props for the component.
 * @returns {ReactNode} The rendered component.
 */
export const LoaderModal = ({isOpen, message}: LoaderModalProps) => {

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
                transition={{ delay: 0.2 }}
                variants={modalVariants}
                className="relative w-64 p-4 mx-auto h-64"
            >
                <div className="relative rounded-lg shadow-lg bg-white w-full h-full flex flex-col items-center justify-center">
                    <span className="loader"></span>
                    <span className={'font-medium p-2 text-center text-gray-500'}>{message}</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

