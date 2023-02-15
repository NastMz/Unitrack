import {motion} from "framer-motion";
import L from "leaflet";
import {FaMapMarkerAlt} from "react-icons/fa";
import {BusStop, Coordinates} from "../../models/interfaces";
import {useState} from "react";
import {ImageModal} from "./ImageModal";

export interface PopUpProps {
    userLocation: Coordinates;
    busStop: BusStop;
}

/**
 * PopUp component.
 *
 * This component is the pop up of the map to show the information of the bus stop.
 *
 * @returns {JSX.Element} - The rendered component.
 */
export const PopUp = ({busStop, userLocation}: PopUpProps) => {

    // Get the user location.
    const userPoint = L.latLng(userLocation.lat, userLocation.lng);

    // Get the bus stop location.
    const busStopPoint = L.latLng(busStop.coordinates.lat, busStop.coordinates.lng);

    // Calculate the distance between the user and the bus stop.
    const distance = Number((userPoint.distanceTo(busStopPoint) / 1000).toFixed(2));

    const [showImage, setShowImage] = useState(false);

    return (
        <>
            <motion.div
                initial={{scale: 0}}
                animate={{scale: 1}}
                exit={{scale: 0}}
                className={'p-6 divide-x lg:divide-x-0 lg:divide-y divide-solid divide-color-white flex flex-row lg:flex-col min-h-fit w-[90%] lg:w-72 absolute mx-auto lg:mx-10 z-20 top-96 lg:top-36 relative drop-shadow-md shadow-black origin-top-left'}
            >
                <div
                    className={'opacity-80 bg-gradient-to-b from-main-600 to-main-500 absolute inset-0 rounded-lg -z-10'}/>

                <div
                    className={'w-full lg:h-28 pr-4 lg:pr-0 rounded-md overflow-hidden z-10 cursor-pointer'}
                    onClick={() => setShowImage(true)}
                >
                    <img src={busStop.image} className={'object-cover h-full w-full'}/>
                </div>
                <div className={'flex gap-3 flex-col text-white pl-4 lg:pl-0 lg:pt-4 z-10'}>
                    <div>
                        <div className={'font-bold '}>Distancia desde tu posición:</div>
                        <div className={''}>{`${distance} km`}</div>
                    </div>
                    <div>
                        <div className={'font-bold '}>Paradero:</div>
                        <div className={''}>{busStop.name}</div>
                    </div>
                    <div>
                        <div className={'font-bold'}>Descripción</div>
                        <div className={''}>{busStop.description}</div>
                    </div>
                </div>
                <div
                    className={'absolute -top-5 -left-5 bg-white rounded-full h-[50px] w-[50px] flex items-center justify-center'}>
                    <div className={'bg-main-600 rounded-full h-[35px] w-[35px] flex items-center justify-center'}>
                        <FaMapMarkerAlt className={'text-white'}/>
                    </div>
                </div>
            </motion.div>
            <ImageModal
                isOpen={showImage}
                image={busStop.image}
                setIsOpen={setShowImage}
            />
        </>
    )
}