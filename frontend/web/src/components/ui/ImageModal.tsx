import {motion} from "framer-motion";
import React, {useEffect, useRef} from "react";
import {AiOutlineCloseCircle} from "react-icons/ai";

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
 * @interface ImageModalProps
 * @property {boolean} isOpen - Whether the modal is open or closed.
 * @property {string} image - The image to display.
 * @property {(isOpen: boolean) => void} setIsOpen - The function to call when the modal is closed.
 */
interface ImageModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    image: string;
}


/**
 * ImageModal component.
 *
 * This component displays a modal with a full screen image.
 *
 * @param {ImageModalProps} props - Props for the component.
 * @returns {ReactNode} The rendered component.
 */
export const ImageModal = ({isOpen, setIsOpen, image}: ImageModalProps) => {

    const ref = useRef<any>();

    const closeModal = (e: any) => {
        if (ref.current && !ref.current.contains(e.target)) {
            setIsOpen(false);
        }
    }

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', closeModal);
        } else {
            document.removeEventListener('mousedown', closeModal);
        }
    }, [isOpen]);

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
                className="relative w-[80%] p-4 mx-auto"
                ref={ref}
            >
                <div className={'w-full rounded-md overflow-hidden relative'}>
                    <div
                        className={'absolute top-0 right-0 p-2 cursor-pointer text-white hover:text-gray-400'}
                        onClick={() => setIsOpen(false)}
                    >
                        <AiOutlineCloseCircle size={32}/>
                    </div>
                    <img src={image} className={'object-cover h-full w-full'}/>
                </div>
            </motion.div>
        </motion.div>
    );
}