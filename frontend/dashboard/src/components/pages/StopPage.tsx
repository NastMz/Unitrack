import {LoaderModal, Modal, Table} from "../common";
import {useDispatch, useSelector} from "react-redux";
import {selectStops} from "../../redux/selectors";
import {useState} from "react";
import {Stop} from "../../models/interfaces";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {deleteStop} from "../../api";
import {removeStop} from "../../redux/actions";
import {StopForm} from "../ui";

/**
 * StopPage component.
 *
 * This component is used to render the stops crud page.
 *
 * @returns {JSX.Element} - The component.
 */
export const StopPage = () => {

    const stops = useSelector(selectStops);

    // Loading state
    const [loading, setLoading] = useState<boolean>(false);

    // Show success modal state
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Show error modal state
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Stop state
    const [stop, setStop] = useState<Stop | null>(null);

    // Stop form modal state.
    const [formIsOpen, setFormIsOpen] = useState(false);

    // Function to close the stop form modal.
    const onFormClose = () => {
        setFormIsOpen(false);
    }

    // Context state (edit or create) for the stop form.
    const [context, setContext] = useState<'edit' | 'create'>('create');

    const queryClient = useQueryClient();

    const dispatch = useDispatch();

    const deleteStopMutate = useMutation({
        mutationFn: deleteStop,
        onSuccess: () => {
            queryClient.invalidateQueries(['apiStops']);
            setLoading(false);
            setShowSuccess(true);
            setSuccessMessage('Paradero eliminado correctamente.');
        },
        onError: (error) => {
            setLoading(false);
            setShowError(true);
            setErrorMessage('Ocurrío un error inesperado al eliminar el paradero.');
        }
    });

    const handleDeleteStop = (stop: Stop) => {
        setLoading(true);
        deleteStopMutate.mutate(stop.id);
        dispatch(removeStop(stop.id));
    }

    const tableStops = stops.map((stop) => {
        let timetables = '';
        stop.timetables.forEach((timetable) => {
            timetables += timetable.hour + ', ';
        });

        timetables = timetables.slice(0, -2);

        return {
            id: stop.id,
            name: stop.name,
            description: stop.description,
            latitude: stop.coordinates.lat,
            longitude: stop.coordinates.lng,
            image: stop.image,
            timetables: timetables
        }
    });

    const setSelectedStop = (stop: any) => {
        const stopToSet = stops.find((stopItem) => stopItem.id === stop.id);

        if (stopToSet) {
            setStop(stopToSet);
        }
    }

    return (
        <div
            className={'h-full w-full'}
        >
            <Table
                headersMap={{
                    id: 'ID',
                    name: 'Paradero',
                    description: 'Descripción',
                    latitude: 'Latitud',
                    longitude: 'Longitud',
                    image: 'URL de la Imagen',
                    timetables: 'Horarios'
                }}
                data={tableStops}
                setContext={setContext}
                setShowForm={setFormIsOpen}
                deleteRecord={handleDeleteStop}
                setSelectedRecord={setSelectedStop}
                itemsPerPage={5}
            />

            <StopForm
                stop={stop}
                isOpen={formIsOpen}
                onClose={onFormClose}
                setLoading={setLoading}
                setShowSuccess={setShowSuccess}
                setSuccessMessage={setSuccessMessage}
                setShowError={setShowError}
                setErrorMessage={setErrorMessage}
                context={context}
            />


            {/* Loader modal */}
            <LoaderModal isOpen={loading} message={'Procesando, por favor espere...'}/>

            {/* Success alert */}
            <Modal
                isOpen={showSuccess}
                type="success"
                title="Éxito"
                message={successMessage}
                buttonText="Aceptar"
                onButtonClick={() => setShowSuccess(false)}
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
        </div>
    )
}