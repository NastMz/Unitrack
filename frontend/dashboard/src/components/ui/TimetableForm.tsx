import React, {useEffect} from "react";
import {motion} from "framer-motion";
import {NewTimetable, Timetable, UpdateTimetable} from "../../models/interfaces";
import {useFormik} from "formik";
import * as Yup from "yup";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {AiOutlineFieldTime} from "react-icons/ai";
import {addTimetable, updateTimetable} from "../../api";

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
 * Interface for TimetableForm component props.
 *
 * @interface TimetableFormProps
 * @property {Timetable} timetable - The timetable information.
 * @property {boolean} isOpen - Whether the modal is open or closed.
 * @property {() => void} onClose - The function to close the modal.
 * @property {(value: boolean) => void} setLoading - The function to set the loading state.
 * @property {(value: boolean) => void} setShowSuccess - The function to set the show success state.
 * @property {(value: string) => void} setSuccessMessage - The function to set the success message.
 * @property {(value: boolean) => void} setShowError - The function to set the show error state.
 * @property {(value: string) => void} setErrorMessage - The function to set the error message.
 */
interface TimetableFormProps {
    timetable: Timetable | null;
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
 * TimetableForm component.
 *
 * This component displays a form to update a timetable's information.
 *
 * @param {TimetableFormProps} props - Props for the component.
 * @returns {ReactNode} The rendemain component.
 */
export const TimetableForm: React.FC<TimetableFormProps> = ({
                                                                timetable,
                                                                isOpen,
                                                                setLoading,
                                                                setShowSuccess,
                                                                setSuccessMessage,
                                                                setShowError,
                                                                setErrorMessage,
                                                                onClose,
                                                                context
                                                            }: TimetableFormProps) => {

    // Handle click on cancel button
    const closeForm = () => {
        formik.resetForm();
        onClose();
    };

    const queryClient = useQueryClient();

    const addTimetableMutation = useMutation({
        mutationFn: addTimetable,
        onSuccess: (response) => {
            queryClient.invalidateQueries(['apiTimetables']).then(r => {
                if (response.status === 200) {
                    setSuccessMessage('Horario creado exitosamente');
                    setShowSuccess(true);
                    closeForm();
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

    const updateTimetableMutation = useMutation({
        mutationFn: updateTimetable,
        onSuccess: (response) => {
            queryClient.invalidateQueries(['apiTimetables']).then(r => {
                if (response.status === 200) {
                    setSuccessMessage('Horario actualizado exitosamente');
                    setShowSuccess(true);
                    closeForm();
                } else {
                    const errors = response.data.message;
                    setErrorMessage(errors);
                    setShowError(true);
                }
                setLoading(false)
            });
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
    });

    // Formik logics
    const formik = useFormik({
        initialValues: {
            hour: '',
        },

        // Validate form
        validationSchema: Yup.object({
            hour: Yup.string().required('Por favor ingrese una hora'),
        }),

        // Submit form
        onSubmit: async (values) => {
            setLoading(true);
            if (context === 'edit' && timetable) {
                const updatedTimetable: UpdateTimetable = {
                    hour: values.hour + ':00',
                };

                updateTimetableMutation.mutate({id: timetable.id, timetable: updatedTimetable});
            } else {
                const newTimetable: NewTimetable = {
                    hour: values.hour + ':00',
                };
                addTimetableMutation.mutate(newTimetable);
            }
        },
    });

    useEffect(() => {
        if (context === 'edit' && timetable) {
            formik.setValues({
                hour: timetable.hour,
            });
        }
    }, [context, timetable]);

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
                className="relative w-[90%] lg:w-[40%] mx-auto"
            >
                <div className="relative rounded-lg shadow-lg bg-white overflow-x-hidden">
                    <div className={`flex items-center px-4 py-4 text-main-500`}>
                        <AiOutlineFieldTime size={48}/>
                        <div className={"ml-4 font-semibold text-lg leading-tight"}>
                            {context === 'edit' ? 'Editar horario' : 'Crear horario'}
                        </div>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="px-4 pb-4 flex flex-col gap-2">

                        {/* Name input field*/}
                        <div className={"pb-4 w-full"}>
                            <label
                                className={"block text-sm font-medium pb-1"}
                                htmlFor="hour">
                                Nombre
                            </label>
                            <input
                                type="time"
                                id="hour"
                                name="hour"
                                placeholder="00:00:00"
                                className={"border border-slate-300 text-sm focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-500 py-2 px-3 rounded-md shadow-sm placeholder-slate-400 w-full"}
                                value={formik.values.hour}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            <span className={"text-sm text-red-600 italic"}>
                                    {formik.touched.hour && formik.errors.hour ? formik.errors.hour : ''}
                                </span>
                        </div>

                        <div className="px-4 py-4 flex gap-8 justify-center">
                            <button
                                type={'button'}
                                className="px-4 py-2 rounded-md text-sm font-semibold bg-slate-400 hover:bg-slate-500 focus:outline-none focus:bg-slate-500"
                                onClick={closeForm}
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

