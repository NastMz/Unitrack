import {AnimatePresence, motion} from "framer-motion";
import {Sidebar} from "../ui";

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

    return (
        <div className={"h-screen max-h-screen flex"}>
            <Sidebar className={''}/>
            <AnimatePresence mode={"wait"}>
                <div className={'w-full'}>
                    <motion.main
                        initial={{width: 0}}
                        animate={{width: '100%'}}
                        exit={{width: window.innerWidth, transition: {duration: 0.3}}}
                        key={props.pageName}
                        className={'flex flex-col px-12 py-8 flex-grow'}
                    >
                        <h2 className={'font-bold text-3xl flex-shrink mb-4'}>{props.pageName}</h2>
                        <p className={'mb-8'}>{props.description}</p>
                        <div
                            className={'flex items-center justify-center flex-grow rounded-xl'}
                        >
                            {props.page}
                        </div>

                    </motion.main>
                </div>
            </AnimatePresence>
        </div>
    )
}