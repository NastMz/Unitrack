import React, {useEffect} from "react";
import {motion} from "framer-motion";
import {NewUser, UpdateUser, User} from "../../models/interfaces";
import {useFormik} from "formik";
import * as Yup from "yup";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {AiOutlineUser} from "react-icons/ai";
import {addUser, updateUser} from "../../api";

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
 * Interface for UserForm component props.
 *
 * @interface UserFormProps
 * @property {User} user - The user information.
 * @property {boolean} isOpen - Whether the modal is open or closed.
 * @property {() => void} onClose - The function to close the modal.
 * @property {(value: boolean) => void} setLoading - The function to set the loading state.
 * @property {(value: boolean) => void} setShowSuccess - The function to set the show success state.
 * @property {(value: string) => void} setSuccessMessage - The function to set the success message.
 * @property {(value: boolean) => void} setShowError - The function to set the show error state.
 * @property {(value: string) => void} setErrorMessage - The function to set the error message.
 */
interface UserFormProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    setLoading: (value: boolean) => void;
    setShowSuccess: (value: boolean) => void;
    setSuccessMessage: (value: string) => void;
    setShowError: (value: boolean) => void;
    setErrorMessage: (value: string) => void;
    context: 'edit' | 'create';
}


/**
 * UserForm component.
 *
 * This component displays a form to update a user's information.
 *
 * @param {UserFormProps} props - Props for the component.
 * @returns {ReactNode} The rendemain component.
 */
export const UserForm: React.FC<UserFormProps> = ({
                                                      user,
                                                      isOpen,
                                                      setLoading,
                                                      setShowSuccess,
                                                      setSuccessMessage,
                                                      setShowError,
                                                      setErrorMessage,
                                                      onClose,
                                                      context
                                                  }: UserFormProps) => {

    // Handle click on cancel button
    const handleClick = () => {
        formik.resetForm();
        onClose();
    };

    const queryClient = useQueryClient();

    const addUserMutation = useMutation({
        mutationFn: addUser,
        onSuccess: (response) => {
            queryClient.invalidateQueries(['apiUsers']).then(r => {
                if (response.status === 200) {
                    setSuccessMessage('Usuario creado exitosamente');
                    setShowSuccess(true);
                    onClose();
                } else {
                    const errors = response.data.message;
                    setErrorMessage(errors);
                    setShowError(true);
                }
                setLoading(false)
            });
        },
        onError: (error) => {
            setErrorMessage('Ocurrio un error inesperado');
            setShowError(true);
            setLoading(false);
        }
    });

    const updateUserMutation = useMutation({
        mutationFn: updateUser,
        onSuccess: (response) => {
            queryClient.invalidateQueries(['apiUsers']).then(r => {
                if (response.status === 200) {
                    setSuccessMessage('Usuario actualizado exitosamente');
                    setShowSuccess(true);
                    onClose();
                } else {
                    const errors = response.data.message;
                    setErrorMessage(errors);
                    setShowError(true);
                }
                setLoading(false)
            });
        },
        onError: (error) => {
            setErrorMessage('Ocurrio un error inesperado');
            setShowError(true);
            setLoading(false);
        }
    });

    // Formik logics
    const formik = useFormik({
        initialValues: {
            name: '',
            lastName: '',
            username: '',
            password: '',
        },

        // Validate form
        validationSchema: Yup.object({
            name: Yup.string().required('Por favor ingrese un nombre'),
            lastName: Yup.string().required('Por favor ingrese un apellido'),
            username: Yup.string().required('Por favor ingrese un nombre de usuario'),
            password: context === 'create' ? Yup.string().required('Por favor ingrese una contraseña') : Yup.string(),
        }),

        // Submit form
        onSubmit: async (values) => {
            setLoading(true);
            if (context === 'edit' && user) {
                const updatedUser: UpdateUser = {
                    firstName: values.name,
                    lastName: values.lastName,
                    username: values.username,
                };

                if (values.password) {
                    updatedUser.password = values.password;
                }

                updateUserMutation.mutate({id: user.id, user: updatedUser});
            } else {
                const newUser: NewUser = {
                    firstName: values.name,
                    lastName: values.lastName,
                    username: values.username,
                    password: values.password,
                };
                addUserMutation.mutate(newUser);
            }
        },
    });

    useEffect(() => {
        if (context === 'edit' && user) {
            formik.setValues({
                name: user.firstName,
                lastName: user.lastName,
                username: user.username,
                password: ''
            });
        }
    }, [context, user]);

    return (
        <motion.div
            initial="closed"
            animate={isOpen ? 'open' : 'closed'}
            exit="closed"
            variants={backgroundVariants}
            className={`${
                isOpen ? 'block' : 'hidden'
            } fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center`}
        >
            <motion.div
                initial="closed"
                animate={isOpen ? 'open' : 'closed'}
                exit="closed"
                transition={{delay: 0.2}}
                variants={modalVariants}
                className="relative w-[90%] lg:w-[60%] mx-auto"
            >
                <div className="relative rounded-lg shadow-lg bg-white overflow-x-hidden">
                    <div className={`flex items-center px-4 py-4 text-main-500`}>
                        <AiOutlineUser size={48}/>
                        <div className={"ml-4 font-semibold text-lg leading-tight"}>
                            {context === 'edit' ? 'Editar usuario' : 'Crear usuario'}
                        </div>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="px-4 pb-4 flex flex-col gap-2">

                        <div className={'grid md:grid-cols-2 gap-x-4 lg:gap-x-8'}>
                            {/* Name input field*/}
                            <div className={"pb-4 w-full"}>
                                <label
                                    className={"block text-sm font-medium pb-1"}
                                    htmlFor="name">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="John"
                                    className={"border border-slate-300 text-sm focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-500 py-2 px-3 rounded-md shadow-sm placeholder-slate-400 w-full"}
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <span className={"text-sm text-red-600 italic"}>
                                    {formik.touched.name && formik.errors.name ? formik.errors.name : ''}
                                </span>
                            </div>

                            {/* Lastname input field*/}
                            <div className={"pb-4 w-full"}>
                                <label
                                    className={"block text-sm font-medium pb-1"}
                                    htmlFor="lastName">
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Doe"
                                    className={"border border-slate-300 text-sm focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-500 py-2 px-3 rounded-md shadow-sm placeholder-slate-400 w-full"}
                                    value={formik.values.lastName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <span className={"text-sm text-red-600 italic"}>
                                    {formik.touched.lastName && formik.errors.lastName ? formik.errors.lastName : ''}
                                </span>
                            </div>
                        </div>

                        <div className={'grid md:grid-cols-2 gap-x-4 lg:gap-x-8'}>
                            {/* Username input field*/}
                            <div className={"pb-4 w-full"}>
                                <label
                                    className={"block text-sm font-medium pb-1"}
                                    htmlFor="username">
                                    Usuario
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="jdoe"
                                    className={"border border-slate-300 text-sm focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-500 py-2 px-3 rounded-md shadow-sm placeholder-slate-400 w-full"}
                                    value={formik.values.username}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <span className={"text-sm text-red-600 italic"}>
                                    {formik.touched.username && formik.errors.username ? formik.errors.username : ''}
                                </span>
                            </div>

                            {/* Password input field*/}
                            <div className={"pb-4 w-full"}>
                                <label
                                    className={"block text-sm font-medium pb-1"}
                                    htmlFor="password">
                                    Contraseña {context === 'edit' ? '(opcional)' : ''}
                                </label>
                                <input
                                    type="text"
                                    id="password"
                                    name="password"
                                    placeholder="********"
                                    className={"border border-slate-300 text-sm focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-500 py-2 px-3 rounded-md shadow-sm placeholder-slate-400 w-full"}
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <span className={"text-sm text-red-600 italic"}>
                                    {formik.touched.password && formik.errors.password ? formik.errors.password : ''}
                                </span>
                            </div>
                        </div>

                        <div className="px-4 py-4 flex gap-8 justify-center">
                            <button
                                type={'button'}
                                className="px-4 py-2 rounded-md text-sm font-semibold bg-slate-400 hover:bg-slate-500 focus:outline-none focus:bg-slate-500"
                                onClick={handleClick}
                            >
                                Cancelar
                            </button>
                            <button
                                type={'submit'}
                                className="ml-4 px-4 py-2 rounded-md text-white text-sm font-semibold bg-main-600 hover:bg-main-500 focus:outline-none focus:bg-main-500"
                            >
                                {context === 'edit' ? 'Actualizar' : 'Crear'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

