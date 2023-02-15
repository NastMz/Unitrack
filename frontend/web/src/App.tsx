import {Navbar} from "./components/layout/";
import {CurrentPositionButton, MapView, PopUp} from "./components/ui";
import {AnimatePresence} from "framer-motion";
import {useEffect, useState} from "react";
import {Loader, LoaderModal, Modal} from "./components/common";
import {useMutation, useQuery} from "@tanstack/react-query";
import {getBusStops, getStopsByTimetable, getTimetables} from "./api";
import {BusStop, Coordinates, Timetable} from "./models/interfaces";
import {useDispatch} from "react-redux";
import {addBusStop, addTimetable} from "./redux/actions";
import {removeAllBusStops} from "./redux/actions/busStopActions";


function App() {
    // User location.
    const [userLocation, setUserLocation] = useState<Coordinates>({lat: 0, lng: 0});

    // Loading state.
    const [loading, setLoading] = useState<boolean>(true);

    // State to control the popup.
    const [isShowingPopup, setIsShowingPopup] = useState(false);

    // State to control the centering of the map.
    const [centerMap, setCenterMap] = useState(false);

    // Error message.
    const [errorMessage, setErrorMessage] = useState('');

    // Modal state.
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const [showBusStops, setShowBusStops] = useState(false);

    const dispatch = useDispatch();

    // Get the bus stops.
    useQuery({
            queryKey: ['timetables'],
            queryFn: getTimetables,
            onSuccess: (data) => {
                // Add the bus stops to the redux store.
                data.forEach((timetable: Timetable) => {
                    dispatch(addTimetable(timetable));
                });

                setSelectedTimetable(data[0]);

                setLoading(false);
            },
            onError: (error) => {
                setErrorMessage('Error al cargar los horarios. Inténtelo de nuevo más tarde.');
                setModalIsOpen(true);
                setLoading(false);
            }

        }
    );

    // Selected timetable state.
    const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);

    // Selected bus stop state.
    const [selectedBusStop, setSelectedBusStop] = useState<BusStop | null>(null);

    // Loading state for the bus stops.
    const [loadingBusStops, setLoadingBusStops] = useState<boolean>(false);

    // Mutation to get the bus stops from the API.
    const busStopMutation = useMutation({
        mutationFn: getBusStops,
        onSuccess: (data) => {
            dispatch(removeAllBusStops());
            // Add the bus stops to the redux store.
            data.forEach((busStop: BusStop) => {
                dispatch(addBusStop(busStop));
            });
            setLoadingBusStops(false);
        },
        onError: (error) => {
            setErrorMessage('Error al cargar los paraderos. Inténtelo de nuevo más tarde.');
            setModalIsOpen(true);
            setLoadingBusStops(false);
        }
    });

    // Mutation to get the bus stops by timetable from the API.
    const busStopTimetableMutation = useMutation({
        mutationFn: getStopsByTimetable,
        onSuccess: (data) => {
            // Get the bus stops.
            busStopMutation.mutate(data);
        },
        onError: (error) => {
            setErrorMessage('Error al cargar los paraderos. Inténtelo de nuevo más tarde.');
            setModalIsOpen(true);
            setLoadingBusStops(false);
        }
    });

    // Get the bus stops when the selected timetable changes.
    useEffect(() => {
        if (selectedTimetable === null) return;
        setLoadingBusStops(true);
        busStopTimetableMutation.mutate(selectedTimetable.id as number);
    }, [selectedTimetable]);

    useEffect(() => {
        if (centerMap) setCenterMap(false);
    }, [centerMap]);

    return (
        <>
            {
                loading
                    ? <Loader/>
                    : (
                        <div className={'w-screen h-screen overflow-hidden'}>
                            {
                                selectedTimetable &&
                                <Navbar
                                    selectedTimetable={selectedTimetable}
                                    setSelectedTimetable={setSelectedTimetable}
                                    setShowBusStops={setShowBusStops}
                                />
                            }

                            <AnimatePresence>
                                {
                                    isShowingPopup && selectedBusStop && showBusStops && (
                                        <PopUp busStop={selectedBusStop} userLocation={userLocation}/>
                                    )
                                }
                            </AnimatePresence>

                            <MapView
                                isShowingPopUp={isShowingPopup}
                                setIsShowingPopUp={setIsShowingPopup}
                                centerMap={centerMap}
                                userLocation={userLocation}
                                setUserLocation={setUserLocation}
                                setSelectedBusStop={setSelectedBusStop}
                                selectedBusStop={selectedBusStop}
                                showBusStops={showBusStops}
                            />

                            <CurrentPositionButton centerMap={setCenterMap}/>

                            <Modal
                                title={'Error'}
                                message={errorMessage}
                                isOpen={modalIsOpen}
                                onButtonClick={() => window.location.reload()}
                                buttonText={'Recargar'}
                                type={'error'}
                            />

                            <LoaderModal isOpen={loadingBusStops} message={'Cargando paraderos...'}/>
                        </div>
                    )
            }
        </>
    )
}

export default App
