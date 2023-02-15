import {motion} from "framer-motion";
import {BsArrowRightShort} from "react-icons/all";
import {Link} from "react-router-dom";
import Logo from "../../assets/images/icon.svg";

/**
 * NotFound component.
 *
 * This component is used to render the 404 page.
 *
 * @returns {JSX.Element} - The component.
 */
export const NotFound = () => {

    document.title = 'Página no encontrada | Tulipann Store';

    return (
        <motion.div
            initial={{width: 0}}
            animate={{width: '100%'}}
            exit={{width: window.innerWidth, transition: {duration: 0.3}}}
        >
            <div className={"flex flex-col gap-6 items-center justify-center text-center p-40 h-screen"}>
                <div className={"h-24"}>
                    <img src={Logo} alt={Logo} className={`h-full w-full object-cover`}/>
                </div>
                <div className={"flex flex-col gap-6"}>
                    <div className={"flex flex-col gap-1"}>
                        <span className={"text-red-600 text-sm font-medium"}>404</span>
                        <h1 className={"text-3xl font-bold"}>Página no encontrada</h1>
                        <span className={"text-sm text-gray-400"}>Lo sentimos, no pudimos encontrar la página que estas buscando</span>
                    </div>
                    <Link to={"/"} className={"font-medium text-sm text-red-600 flex justify-center items-center"}>
                        <span>Regresar al inicio</span> <BsArrowRightShort size={20} className={""}/>
                    </Link>
                </div>
            </div>
        </motion.div>
    )
}