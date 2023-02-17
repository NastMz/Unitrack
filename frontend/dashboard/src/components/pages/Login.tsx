import {useNavigate} from "react-router-dom";
import {routes} from "../../config/routes";
import {useFormik} from "formik";
import * as Yup from "yup";
import {AnimatePresence, motion} from "framer-motion";
import {useState} from "react";
import {VscEye, VscEyeClosed} from "react-icons/vsc";
import {LoaderModal, Modal} from "../common";
import {useDispatch} from "react-redux";
import {FaMapMarkedAlt} from "react-icons/fa";
import {useMutation} from "@tanstack/react-query";
import {login} from "../../api";
import {setLoggedUser} from "../../redux/actions";

/**
 * Login component.
 *
 * This component displays a login form and calls the `login` function when the form is submitted.
 *
 * @returns {ReactNode} The rendemain component.
 */
export const Login = () => {

    document.title = routes.login.title;

    const dispatch = useDispatch();

    // Loading state
    const [loading, setLoading] = useState<boolean>(false);

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: (response) => {
            if (response.status === 200) {
                // Get the tokens
                const accessToken = response.data.access_token;
                const refreshToken = response.data.refresh_token;

                // Store the tokens
                sessionStorage.setItem("access_token", accessToken);
                sessionStorage.setItem("refresh_token", refreshToken);

                setLoading(false);
                setShowSuccess(true);
            } else {
                setLoading(false);
                setShowError(true);
                setErrorMessage('Usuario o contraseña incorrectos.');
            }
        },
        onError: (error: any) => {
            setLoading(false);
            setShowError(true);
            let errorMsg = error.response.data.message;

            if (errorMsg) {
                setErrorMessage(errorMsg);
            } else {
                setErrorMessage('Ha ocurrido un error inesperado.');
            }
        }
    })

    // Formik logics
    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
        },

        // Validate form
        validationSchema: Yup.object({
            username: Yup.string().required('Por favor introduce un usuario'),
            password: Yup.string().required('Por favor introduce una contraseña'),
        }),

        // Submit form
        onSubmit: async (values) => {
            dispatch(setLoggedUser(values.username));
            setLoading(true);
            loginMutation.mutate(values);
        },
    });

    // State variables
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Password visibility state.
    const [shown, setShown] = useState<boolean>(false);

    // Switch the password visibility.
    const switchShown = () => setShown(!shown);

    const navigate = useNavigate();

    const redirect = () => {
        setShowSuccess(false);
        navigate(routes.home.path);
    };

    return (
        <motion.div
            initial={{width: 0}}
            animate={{width: '100%'}}
            exit={{width: 0}}
        >
            {/* Loader modal */}
            <LoaderModal isOpen={loading} message={'Cargando, por favor espera.'}/>

            {/* Success alert */}
            <Modal
                isOpen={showSuccess}
                type="success"
                title="Éxito"
                message="Se ha iniciado sesión con éxito"
                buttonText="Continuar"
                onButtonClick={() => redirect()}
            />

            {/* Error alert */}
            <Modal
                isOpen={showError}
                type="error"
                title="Error"
                message={errorMessage}
                buttonText="Aceptar"
                onButtonClick={() => setShowError(false)}
            />

            {/* Form */}
            <div className={"flex flex-col gap-8 justify-center items-center h-screen bg-slate-50 p-4 md:p-8"}>
                <div className={"flex flex-col items-center justify-center text-center gap-4"}>
                    <div className={'text-3xl font-bold flex gap-2 items-center'}>
                        <FaMapMarkedAlt className={'text-main-600'}/> UniTrack
                    </div>
                    <div className={'flex flex-col gap-2'}>
                        <h1 className={"text-3xl font-bold"}>{routes.login.name}</h1>
                        <p>{routes.login.description}</p>
                    </div>
                </div>
                <form onSubmit={formik.handleSubmit} action="src/components/pages"
                      className={"bg-white py-6 px-8 rounded-lg border border-slate-100 shadow-sm w-full md:w-96"}>
                    {/*Email input field*/}
                    <div className={"pb-4"}>
                        <label
                            className={"block text-sm font-medium pb-1"}
                            htmlFor="username">
                            Usuario
                        </label>
                        <input
                            type="username"
                            id="username"
                            name="username"
                            placeholder="Ingresa tu usuario"
                            className={"border border-slate-300 text-sm focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-500 py-2 px-3 rounded-md shadow-sm placeholder-slate-400 w-full"}
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        <span
                            className={"text-sm text-main-600 italic"}>{formik.touched.username && formik.errors.username ? formik.errors.username : ''}</span>
                    </div>
                    {/*Password input field*/}
                    <div className={"pb-4"}>
                        <label
                            className={"block text-sm font-medium pb-1"}
                            htmlFor="password">
                            Contraseña
                        </label>
                        <div className="w-full h-fit relative">
                            <input
                                type={shown ? 'text' : 'password'}
                                id="password"
                                name="password"
                                placeholder="Ingresa tu contraseña"
                                className={"border border-slate-300 text-sm focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-500 py-2 px-3 rounded-md shadow-sm placeholder-slate-400 w-full"}
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <AnimatePresence>
                                <motion.div
                                    initial={{opacity: 0, scale: 0.5}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0, scale: 0.5}}
                                    className="absolute h-full right-3 top-0 flex justify-center items-center cursor-pointer"
                                    onClick={() => switchShown()}
                                    key={shown ? '1' : '2'}
                                >
                                    {shown
                                        ? <VscEyeClosed size={20} className={"text-slate-400"}/>
                                        : <VscEye size={20} className={"text-slate-400"}/>
                                    }
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <span
                            className={"text-sm text-main-600 italic"}>{formik.touched.password && formik.errors.password ? formik.errors.password : ''}</span>
                    </div>
                    <button type={'submit'}
                            className={"w-full my-1 md:my-4 bg-main-500 hover:bg-main-400 text-center p-2 text-white font-medium cursor-pointer flex-grow rounded-md"}>
                        Iniciar sesión
                    </button>
                </form>
            </div>
        </motion.div>
    );
}