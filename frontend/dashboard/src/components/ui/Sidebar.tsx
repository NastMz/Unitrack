import {routes} from "../../config/routes";
import {SidebarCard} from "./SidebarCard";
import {Link, useLocation} from "react-router-dom";
import {FaMapMarkedAlt, FaUserCircle} from "react-icons/fa";

/**
 * Function to get the app routes array.
 *
 * @returns {Array} - The routes array.
 */
const routesArray = () => {
    let array = [];
    for (const [key, value] of Object.entries(routes)) {
        array.push(value);
    }
    return array;
}

/**
 * Sidebar component props.
 *
 * @interface SidebarProps
 * @param {string} className - The class firstName for the component.
 */
interface SidebarProps {
    className?: string
}

/**
 * Sidebar component.
 *
 * This component is used to render the sidebar.
 *
 * @param {SidebarProps} props - The props for the component.
 * @returns {JSX.Element} - The component.
 */
export const Sidebar = (props: SidebarProps) => {

    const location = useLocation();

    return (
        <aside className={`h-full flex flex-col border-r border-gray-200 ${props.className}`}>
            <Link to={routes.home.path} className={'text-3xl font-bold p-8 flex gap-2 items-center'}>
                <FaMapMarkedAlt className={'text-main-600'}/> UniTrack
            </Link>
            <div className={'flex-grow px-2 w-full overflow-y-auto flex flex-col gap-1'}>
                {
                    routesArray().map((route) => (
                        <SidebarCard to={route.path}
                                     icon={route.icon}
                                     name={route.name}
                                     isActive={location.pathname === route.path}
                                     key={Math.random()}
                        />
                    ))
                }
            </div>
            <div
                className={'w-full flex-shrink flex gap-2 items-center p-6 font-medium text-md border-t border-gray-200'}>
                <FaUserCircle className={'text-4xl'}/>
                <div className={'flex flex-col'}>
                    <span>Administrador</span>
                    <span className={"text-gray-400 font-base text-sm"}>Cerrar Sesión</span>
                </div>
            </div>
        </aside>
    )
}