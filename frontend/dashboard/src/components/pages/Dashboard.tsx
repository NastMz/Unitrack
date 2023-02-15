import {motion} from "framer-motion";

export const Dashboard = () => {
    return (
        <motion.div
            initial={{width: 0}}
            animate={{width: '100%'}}
            exit={{width: window.innerWidth, transition: {duration: 0.3}}}
            className={'h-full w-full border-4 border-gray-200 rounded-xl border-dashed'}
        >
            <div >

            </div>
        </motion.div>
    )
}