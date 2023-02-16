import {LoaderModal, Modal, Table} from "../common";
import {useDispatch, useSelector} from "react-redux";
import {selectTimetables} from "../../redux/selectors";
import {useState} from "react";
import {Timetable} from "../../models/interfaces";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {deleteTimetable} from "../../api";
import {removeTimetable} from "../../redux/actions";
import {TimetableForm} from "../ui";

export const TimetablePage = () => {

    const timetables = useSelector(selectTimetables);

    // Loading state
    const [loading, setLoading] = useState<boolean>(false);

    // Show success modal state
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Show error modal state
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Timetable state
    const [timetable, setTimetable] = useState<Timetable | null>(null);

    // Timetable form modal state.
    const [formIsOpen, setFormIsOpen] = useState(false);

    // Function to close the timetable form modal.
    const onFormClose = () => {
        setFormIsOpen(false);
    }

    // Context state (edit or create) for the timetable form.
    const [context, setContext] = useState<'edit' | 'create'>('create');

    const queryClient = useQueryClient();

    const dispatch = useDispatch();

    const deleteTimetableMutate = useMutation({
        mutationFn: deleteTimetable,
        onSuccess: () => {
            queryClient.invalidateQueries(['apiTimetables']);
            setShowSuccess(true);
            setSuccessMessage('Usuario eliminado correctamente.');
        },
        onError: (error) => {
            setShowError(true);
            setErrorMessage('Ha ocurrido un error al eliminar el usuario.');
        }
    });

    const handleDeleteTimetable = (timetable: Timetable) => {
        dispatch(removeTimetable(timetable.id));
        deleteTimetableMutate.mutate(timetable.id);
    }

    return (
        <div
            className={'h-full w-full'}
        >
            <Table
                headersMap={{
                    id: 'ID',
                    hour: 'Hora',
                }}
                data={timetables}
                setContext={setContext}
                setShowForm={setFormIsOpen}
                deleteRecord={handleDeleteTimetable}
                setSelectedRecord={setTimetable}
                itemsPerPage={5}
            />

            <TimetableForm
                timetable={timetable}
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