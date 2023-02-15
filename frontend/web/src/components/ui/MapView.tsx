import {MapContainer, Marker, Popup, TileLayer, useMap} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {FaMapMarkerAlt} from 'react-icons/fa';
import L, {DivIcon} from 'leaflet';
import ReactDOMServer from "react-dom/server";
import {useEffect, useRef, useState} from "react";
import {WavesIcon} from "./WavesIcon";
import {LoaderModal, Modal} from "../common";
import {BusStop, Coordinates} from "../../models/interfaces/";
import {useSelector} from "react-redux";
import {selectBusStops} from "../../redux/selectors";

/**
 * MapViewProps interface.
 *
 * This interface represents the props of the MapView component.
 *
 * @interface MapViewProps
 * @property {boolean} isShowingPopUp - Boolean to control the popup.
 * @property {(show: boolean) => void} setIsShowingPopUp - Function to set the state of the popup.
 * @property {boolean} centerMap - Boolean to center the map.
 * @property {(location: Coordinates) => void} setUserLocation - Function to set the user location.
 * @property {Coordinates} userLocation - The user location.
 * @property {BusStop | null} selectedBusStop - The selected bus stop.
 * @property {(busStop: BusStop) => void} setSelectedBusStop - Function to set the selected bus stop.
 * @property {boolean} showBusStops - Boolean to show the bus stops.
 */
export interface MapViewProps {
    isShowingPopUp: boolean;
    setIsShowingPopUp: (show: boolean) => void;
    centerMap: boolean;
    userLocation: Coordinates;
    setUserLocation: (location: Coordinates) => void;
    selectedBusStop: BusStop | null;
    setSelectedBusStop: (busStop: BusStop) => void;
    showBusStops: boolean;

}

/**
 * MapView component.
 *
 * This component is the map view of the application.
 *
 * @returns {JSX.Element} - The rendered component.
 */
export const MapView = ({
                            isShowingPopUp,
                            setIsShowingPopUp,
                            centerMap,
                            userLocation,
                            setUserLocation,
                            selectedBusStop,
                            setSelectedBusStop,
                            showBusStops
                        }: MapViewProps) => {

    // Loading state.
    const [loading, setLoading] = useState(true);

    // Error message.
    const [errorMessage, setErrorMessage] = useState('');

    // Modal state.
    const [modalIsOpen, setModalIsOpen] = useState(false);

    // Modal click handler.
    const modalClickHandler = () => {
        setModalIsOpen(false);
        window.location.reload();
    }

    // Marker of the user.
    const [userMarker, setUserMarker] = useState<any>(null);

    // Get the bus stops from the redux store.
    const busStops = useSelector(selectBusStops);

    // Get the user location and set the user marker on the map.
    useEffect(() => {
        if (!navigator.geolocation) {
            setErrorMessage("La geolocalización no está soportada por su navegador");
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const updatedLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setUserLocation(updatedLocation);
                setErrorMessage('');
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setErrorMessage("Debe permitir el acceso a la ubicación, para poder utilizar la aplicación. Por favor, permita el acceso a la ubicación y vuelva a cargar la página.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setErrorMessage("La información de ubicación no está disponible");
                        break;
                    case error.TIMEOUT:
                        setErrorMessage("La solicitud para obtener la ubicación del usuario ha caducado");
                        break;
                    default:
                        setErrorMessage("Ha ocurrido un error desconocido");
                        break;
                }
            },
            {
                enableHighAccuracy: true,
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // IIf there is an error, set the loading state to false and open the modal.
    useEffect(() => {
        if (errorMessage !== '') {
            setLoading(false);
            setModalIsOpen(true);
        } else {
            setModalIsOpen(false);
        }
    }, [errorMessage]);

    // If the user location is updated, set the loading state to false.
    useEffect(() => {
        if (userLocation.lat !== 0 && userLocation.lng !== 0) {
            setLoading(false);
        }

        // User marker icon.
        let userIcon = new DivIcon({
            className: 'custom-icon',
            html: ReactDOMServer.renderToString(<WavesIcon/>)
        });

        setUserMarker(
            <Marker position={userLocation} icon={userIcon}>
                <Popup>
                    Estás aquí
                </Popup>
            </Marker>
        );
    }, [userLocation]);

    // Bus stop marker icon.
    const markerIcon = new DivIcon({
        className: 'custom-icon',
        html: ReactDOMServer.renderToString(<div className={'text-main-500 opacity-60'}><FaMapMarkerAlt size={15}/>
        </div>)
    });

    // Selected bus stop marker icon.
    const selectedMarkerIcon = new DivIcon({
        className: 'custom-icon',
        html: ReactDOMServer.renderToString(<div className={'text-main-600'}><FaMapMarkerAlt size={20}/></div>)
    });

    // Handle the click on the marker.
    const handleMarkerClick = (busStopId: number) => {
        if (isShowingPopUp) {
            setIsShowingPopUp(false);
        }

        setTimeout(() => {
            let busStop = busStops.find((busStop) => busStop.id === busStopId);

            if (busStop) {
                setSelectedBusStop(busStop);
                setIsShowingPopUp(true);
            }
        }, 100);
    }

    // Select the closer bus stop.
    useEffect(() => {

        if (busStops.length > 0 && !loading){
            // Get closer bus stop to the user.
            let closerBusStop = null;
            const userPoint = L.latLng(userLocation.lat, userLocation.lng);
            let minor = 10000000;
            busStops.forEach((busStop) => {
                let busStopPoint = L.latLng(busStop.coordinates.lat, busStop.coordinates.lng);
                let distance = userPoint.distanceTo(busStopPoint)
                if (distance < minor) {
                    minor = distance;
                    closerBusStop = busStop;
                }
            });

            if (closerBusStop !== null) {
                console.log('L');
                // @ts-ignore
                handleMarkerClick(closerBusStop.id);
            }
        }

    }, [busStops, loading]);

    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (!mapRef.current) {
            return;
        }

        const bounds = new L.LatLngBounds([]);
        busStops.forEach(marker => bounds.extend(marker.coordinates));
        mapRef.current.fitBounds(bounds);
    }, [busStops]);

    return (
        <>
            <LoaderModal isOpen={loading} message={'Cargando tú ubicación...'}/>

            {
                !loading && (
                    <div className={'absolute inset-0 z-10'}>
                        <MapContainer center={userLocation} zoom={13} className={'h-screen w-screen'} ref={mapRef}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {userMarker}
                            {
                                centerMap && <RecenterAutomatically location={userLocation}/>
                            }
                            {
                                busStops.length > 0 && showBusStops
                                && busStops.map((busStop: BusStop) => {
                                    if (busStop.id === selectedBusStop?.id) {
                                        return (
                                            <Marker
                                                position={busStop.coordinates}
                                                icon={selectedMarkerIcon}
                                                key={busStop.id}
                                                eventHandlers={{
                                                    click: () => handleMarkerClick(busStop.id)
                                                }}
                                            />
                                        )
                                    } else {
                                        return (
                                            <Marker
                                                position={busStop.coordinates}
                                                icon={markerIcon}
                                                key={busStop.id}
                                                eventHandlers={{
                                                    click: () => handleMarkerClick(busStop.id)
                                                }}
                                            />
                                        )
                                    }
                                })
                            }
                        </MapContainer>
                    </div>
                )
            }

            <Modal
                title={'Error'}
                message={errorMessage}
                isOpen={modalIsOpen}
                onButtonClick={modalClickHandler}
                buttonText={'Recargar'}
                type={'error'}
            />
        </>
    )
}

const RecenterAutomatically = ({location}: { location: { lat: number, lng: number } }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(location, 18);
    }, []);
    return null;
}

