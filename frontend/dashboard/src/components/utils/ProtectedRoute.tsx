import React from "react";
import {validateSession} from "../../api";
import {Navigate} from "react-router-dom";
import {routes} from "../../config/routes";

/**
 * Interface for ProtectedRoute component props
 *
 * @interface ProtectedRouteProps
 * @property {React.ReactNode} children - Children elements to be rendered within the protected route.
 */
interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * ProtectedRoute component.
 *
 * This component displays its children elements within a protected route, checking for authentication before rendering.
 * If the user is not authenticated, it redirects to the login page.
 *
 * @param {ProtectedRouteProps} props - Properties for the ProtectedRoute component.
 * @returns {JSX.Element} A React element representing the ProtectedRoute component.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children}) => {
    // Check for authentication
    if (validateSession()) {
        return (
            <>
                {children}
            </>
        );
    } else {
        return (
            <div className={'flex justify-center items-center w-full h-full p-36 font-bold'}>
                No tienes permiso para acceder a esta página. Redirigiendo a la página de inicio de sesión...
                <Navigate to={routes.login.path} replace={true}/>
            </div>
        );
    }
};
