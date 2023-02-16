import {motion} from "framer-motion";
import {Table} from "../common";

/**
 * StopPage component.
 *
 * This component is used to render the stops crud page.
 *
 * @returns {JSX.Element} - The component.
 */
export const StopPage = () => {

    const data = [
        {
            id: 1,
            name: 'Maracos',
            description: 'Parada de Maracos',
            latitude: 10.123456,
            longitude: -10.123456,
        },
        {
            id: 2,
            name: 'Maracos',
            description: 'Parada de Maracos',
            latitude: 10.123456,
            longitude: -10.123456,
        },
        {
            id: 3,
            name: 'Maracos',
            description: 'Parada de Maracos',
            latitude: 10.123456,
            longitude: -10.123456,
        }
    ]

    return (
        <div
            className={'h-full w-full'}
        >
            <Table headers={['Id', 'Paradero', 'Descripción', 'Latitud', 'Longitud']} data={data} />
        </div>
    )
}