import {LoaderModal, Modal, Table} from "../common";
import {useState} from "react";
import {UserForm} from "../ui";
import {User} from "../../models/interfaces";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {deleteUser} from "../../api";
import {useDispatch, useSelector} from "react-redux";
import {removeAllUsers} from "../../redux/actions";
import {selectUsers} from "../../redux/selectors";

/**
 * UserPage component.
 *
 * This component is used to render the stops crud page.
 *
 * @returns {JSX.Element} - The component.
 */
export const UserPage = () => {

    const users = useSelector(selectUsers);

    // Loading state
    const [loading, setLoading] = useState<boolean>(false);

    // Show success modal state
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Show error modal state
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // User state
    const [user, setUser] = useState<User | null>(null);

    // User form modal state.
    const [formIsOpen, setFormIsOpen] = useState(false);

    // Function to close the user form modal.
    const onFormClose = () => {
        setFormIsOpen(false);
    }

    // Context state (edit or create) for the user form.
    const [context, setContext] = useState<'edit' | 'create'>('create');

    const queryClient = useQueryClient();

    const dispatch = useDispatch();

    const deleteUserMutate = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            dispatch(removeAllUsers());
            queryClient.invalidateQueries(['apiUsers']);
            setLoading(false);
            setShowSuccess(true);
            setSuccessMessage('Usuario eliminado correctamente.');
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

    const handleDeleteUser = (user: User) => {
        setLoading(true);
        deleteUserMutate.mutate(user.id);
    }

    return (
        <div
            className={'h-full w-full'}
        >
            <Table
                headersMap={{
                    id: 'ID',
                    firstName: 'Nombre',
                    lastName: 'Apellido',
                    username: 'Usuario',
                }}
                data={users}
                setContext={setContext}
                setShowForm={setFormIsOpen}
                setSelectedRecord={setUser}
                deleteRecord={(user: User) => handleDeleteUser(user)}
                itemsPerPage={5}
            />

            <UserForm
                user={user}
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