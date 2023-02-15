import {BiHome} from 'react-icons/bi';
import {GiBusStop} from 'react-icons/gi';
import {AiOutlineFieldTime} from 'react-icons/ai';

export const routes = {
    home: {
        path: '/',
        title: 'Dashboard | Unitrack',
        name: 'Dashboard',
        icon: <BiHome/>
    },
    stop: {
        path: '/stops',
        title: 'Paraderos | Unitrack',
        name: 'Paraderos',
        icon: <GiBusStop/>
    },
    timetable: {
        path: '/timetable',
        title: 'Horarios | Unitrack',
        name: 'Horarios',
        icon: <AiOutlineFieldTime/>
    },

}