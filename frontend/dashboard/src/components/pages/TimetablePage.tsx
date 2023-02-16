import {motion} from "framer-motion";
import {Table} from "../common";

export const TimetablePage = () => {

    const data = [
        {
            id: 1,
            hour: "07:00:00",
        },
        {
            id: 2,
            hour: "07:30:00",
        },
        {
            id: 3,
            hour: "08:00:00",
        },
        {
            id: 4,
            hour: "08:30:00",
        }
    ]

    return (
        <div
            className={'h-full w-full'}
        >
            <Table headers={['Id', 'Hora']} data={data}/>
        </div>
    )
}