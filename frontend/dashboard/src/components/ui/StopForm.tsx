import React, {useEffect, useState} from "react";
import {motion} from "framer-motion";
import {NewStop, Stop, Timetable, UpdateStop} from "../../models/interfaces";
import {useFormik} from "formik";
import * as Yup from "yup";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {GiBusStop} from "react-icons/gi";
import {addStop, updateStop} from "../../api";
import {useSelector} from "react-redux";
import {selectTimetables} from "../../redux/selectors";
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
 * Interface for StopForm component props.
 *
 * @interface StopFormProps
 * @property {Stop} stop - The stop information.
 * @property {boolean} isOpen - Whether the modal is open or closed.
 * @property {() => void} onClose - The function to close the modal.
 * @property {(value: boolean) => void} setLoading - The function to set the loading state.
 * @property {(value: boolean) => void} setShowSuccess - The function to set the show success state.
 * @property {(value: string) => void} setSuccessMessage - The function to set the success message.
 * @property {(value: boolean) => void} setShowError - The function to set the show error state.
 * @property {(value: string) => void} setErrorMessage - The function to set the error message.
 */
interface StopFormProps {
    stop: Stop | null;
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
 * StopForm component.
 *
 * This component displays a form to update a stop's information.
 *
 * @param {StopFormProps} props - Props for the component.
 * @returns {ReactNode} The rendemain component.
 */
export const StopForm: React.FC<StopFormProps> = ({
                                                      stop,
                                                      isOpen,
                                                      setLoading,
                                                      setShowSuccess,
                                                      setSuccessMessage,
                                                      setShowError,
                                                      setErrorMessage,
                                                      onClose,
                                                      context
                                                  }: StopFormProps) => {

    // Handle click on cancel button
    const closeForm = () => {
        formik.resetForm();
        setSelectedTimetables([]);
        onClose();
    };

    const queryClient = useQueryClient();

    const addStopMutation = useMutation({
        mutationFn: addStop,
        onSuccess: (response) => {
            queryClient.invalidateQueries(['apiStops']).then(r => {
                if (response.status === 200) {
                    setSuccessMessage('Paradero creado exitosamente');
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

    const updateStopMutation = useMutation({
        mutationFn: updateStop,
        onSuccess: (response) => {
            queryClient.invalidateQueries(['apiStops']).then(r => {
                if (response.status === 200) {
                    setSuccessMessage('Paradero actualizado exitosamente');
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

    // Formik logics
    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            latitude: '',
            longitude: '',
            image: '',
            timetablesIds: [] as number[],
        },

        // Validate form
        validationSchema: Yup.object({
            name: Yup.string().required('Por favor ingrese un nombre'),
            description: Yup.string().required('Por favor ingrese una descripción'),
            latitude: Yup.number().required('Por favor ingrese una latitud'),
            longitude: Yup.number().required('Por favor ingrese una longitud'),
            image: Yup.string().required('Por favor ingrese la url de una imagen'),
            timetablesIds: Yup.array().required('Por favor seleccione al menos un horario').min(1, 'Por favor seleccione al menos un horario'),
        }),

        // Submit form
        onSubmit: async (values) => {
            setLoading(true);
            if (context === 'edit' && stop) {
                const updatedStop: UpdateStop = {
                    name: values.name,
                    description: values.description,
                    latitude: Number(values.latitude),
                    longitude: Number(values.longitude),
                    image: values.image,
                };

                updateStopMutation.mutate({id: stop.id, stop: updatedStop});
            } else {
                const newStop: NewStop = {
                    name: values.name,
                    description: values.description,
                    latitude: Number(values.latitude),
                    longitude: Number(values.longitude),
                    image: values.image,
                    timetableIds: values.timetablesIds,
                };
                addStopMutation.mutate(newStop);
            }
        },
    });

    useEffect(() => {
        if (context === 'edit' && stop) {
            const timetableIds: number[] = stop.timetables.map(timetable => timetable.id);

            formik.setValues({
                name: stop.name,
                description: stop.description,
                latitude: stop.coordinates.lat.toString(),
                longitude: stop.coordinates.lng.toString(),
                image: stop.image,
                timetablesIds: timetableIds,
            });

            if (stop.timetables) {
                setSelectedTimetables(stop.timetables);
            }
        }
    }, [context, stop]);

    const timetables = useSelector(selectTimetables);

    // Timetables selected by the user
    const [selectedTimetables, setSelectedTimetables] = useState<Timetable[]>([]);

    const [selectedOption, setSelectedOption] = useState('');

    // Add selected timetable to selectedTimetables array
    const handleTimetableSelect = (timetable: Timetable) => {
        // Check if timetable is already in selectedTimetables array
        if (!selectedTimetables.find((t) => t.id === timetable.id)) {
            setSelectedTimetables([...selectedTimetables, timetable]);
        }
    }

    // Remove selected timetable from selectedTimetables array
    const handleRemoveTimetable = (timetable: Timetable) => {
        setSelectedTimetables(selectedTimetables.filter((t) => t.id !== timetable.id));
    }

    const handleSelectChange = (e: any) => {
        const selectedTimetableId = parseInt(e.target.value);
        setSelectedOption(selectedTimetableId.toString());
        const selectedTimetable = timetables.find(
            (timetable) => timetable.id === selectedTimetableId
        );
        if (selectedTimetable) {
            handleTimetableSelect(selectedTimetable);
        }
        setSelectedOption('');
    };

    useEffect(() => {
        formik.setFieldValue('timetablesIds', selectedTimetables.map(timetable => timetable.id));
    }, [selectedTimetables]);

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
                className="relative w-[90%] lg:w-[60%] mx-auto my-12 overflow-y-auto rounded-lg shadow-lg bg-white overflow-x-hidden"
            >
                <div className="relative">
                    <div className={`flex items-center px-4 py-4 text-main-500`}>
                        <GiBusStop size={48}/>
                        <div className={"ml-4 font-semibold text-lg leading-tight"}>
                            {context === 'edit' ? 'Editar paradero' : 'Crear paradero'}
                        </div>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="px-4 pb-4 flex flex-col gap-2">

                        <div className={'grid md:grid-cols-2 gap-x-4 lg:gap-x-8'}>
                            {/* Name input field*/}
                            <div className={"pb-4 w-full"}>
                                <label
                                    className={"block text-sm font-medium pb-1"}
                                    htmlFor="name">
                                    Paradero
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Centro"
                                    className={"border border-slate-300 text-sm focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-500 py-2 px-3 rounded-md shadow-sm placeholder-slate-400 w-full"}
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <span className={"text-sm text-red-600 italic"}>
                                    {formik.touched.name && formik.errors.name ? formik.errors.name : ''}
                                </span>
                            </div>

                            {/* Image input field*/}
                            <div className={"pb-4 w-full"}>
                                <label
                                    className={"block text-sm font-medium pb-1"}
                                    htmlFor="name">
                                    URL de la imagen
                                </label>
                                <input
                                    type="text"
                                    id="image"
                                    name="image"
                                    placeholder="https://www.example.com/image.jpg"
                                    className={"border border-slate-300 text-sm focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-500 py-2 px-3 rounded-md shadow-sm placeholder-slate-400 w-full"}
                                    value={formik.values.image}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <span className={"text-sm text-red-600 italic"}>
                                    {formik.touched.image && formik.errors.image ? formik.errors.image : ''}
                                </span>
                            </div>
                        </div>

                        <div className={'grid md:grid-cols-2 gap-x-4 lg:gap-x-8'}>
                            {/* Latitude input field*/}
                            <div className={"pb-4 w-full"}>
                                <label
                                    className={"block text-sm font-medium pb-1"}
                                    htmlFor="latitude">
                                    Latitud
                                </label>
                                <input
                                    type="number"
                                    id="latitude"
                                    name="latitude"
                                    placeholder="9.9999999999"
                                    step="0.0000000001"
                                    className={"border border-slate-300 text-sm focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-500 py-2 px-3 rounded-md shadow-sm placeholder-slate-400 w-full"}
                                    value={formik.values.latitude}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <span className={"text-sm text-red-600 italic"}>
                                    {formik.touched.latitude && formik.errors.latitude ? formik.errors.latitude : ''}
                                </span>
                            </div>

                            {/* Longitude input field*/}
                            <div className={"pb-4 w-full"}>
                                <label
                                    className={"block text-sm font-medium pb-1"}
                                    htmlFor="longitude">
                                    Longitud
                                </label>
                                <input
                                    type="number"
                                    id="longitude"
                                    name="longitude"
                                    placeholder="9.9999999999"
                                    step="0.0000000001"
                                    className={"border border-slate-300 text-sm focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-500 py-2 px-3 rounded-md shadow-sm placeholder-slate-400 w-full"}
                                    value={formik.values.longitude}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <span className={"text-sm text-red-600 italic"}>
                                    {formik.touched.longitude && formik.errors.longitude ? formik.errors.longitude : ''}
                                </span>
                            </div>
                        </div>

                        <div className={'grid md:grid-cols-2 gap-x-4 lg:gap-x-8'}>
                            {/* Description input field*/}
                            <div className={"pb-4 w-full flex flex-col h-full"}>
                                <label
                                    className={"block text-sm font-medium pb-1"}
                                    htmlFor="description">
                                    Descripción
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Paradero ubicado en el centro de la ciudad"
                                    className={"resize-none border border-slate-300 text-sm focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-500 py-2 px-3 rounded-md shadow-sm placeholder-slate-400 w-full flex-grow"}
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <span className={"text-sm text-red-600 italic"}>
                                    {formik.touched.description && formik.errors.description ? formik.errors.description : ''}
                                </span>
                            </div>

                            {/* Timetables input field*/}
                            <div className={"pb-4 w-full"}>
                                <label
                                    className={"block text-sm font-medium pb-1"}
                                >
                                    Horarios
                                </label>

                                {
                                    timetables.length > 0
                                        ? (
                                            <div>
                                                <select
                                                    id="timetablesIds"
                                                    name="timetablesIds"
                                                    className={"border border-slate-300 text-sm focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-500 py-2 px-3 rounded-md shadow-sm placeholder-slate-400 w-full"}
                                                    value={selectedOption}
                                                    onChange={handleSelectChange}
                                                    onBlur={formik.handleBlur}
                                                >
                                                    <option value={''}>Seleccione un horario</option>
                                                    {
                                                        timetables.map((timetable, index) => (
                                                            <option key={index}
                                                                    value={timetable.id}>{timetable.hour}</option>
                                                        ))
                                                    }
                                                </select>

                                                <span className={"text-sm text-red-600 italic"}>
                                    {formik.touched.timetablesIds && formik.errors.timetablesIds ? formik.errors.timetablesIds : ''}
                                </span>

                                                <div className={'flex gap-2 flex-wrap p-4'}>
                                                    {selectedTimetables.map((timetable) => (
                                                        <div key={timetable.id}
                                                             className={'flex gap-1 items-center text-white bg-main-500 rounded-xl py-1 px-2 text-sm'}>
                                                            <span>{timetable.hour}</span>
                                                            <div
                                                                className={'cursor-pointer hover:text-gray-100'}
                                                                onClick={() => handleRemoveTimetable(timetable)}
                                                            >
                                                                <AiOutlineCloseCircle/>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                        : (
                                            <div className={'flex gap-2 flex-wrap p-4'}>
                                                <span className={'text-sm text-gray-500'}>No hay horarios disponibles</span>
                                            </div>
                                        )
                                }
                            </div>
                        </div>

                        <div className="px-4 pb-4 flex gap-8 justify-center">
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

