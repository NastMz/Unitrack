import {BiHome} from 'react-icons/bi';
import {GiBusStop} from 'react-icons/gi';
import {AiOutlineFieldTime, AiOutlineUser} from 'react-icons/ai';

export const routes = {
    home: {
        path: '/',
        title: 'Dashboard | Unitrack',
        name: 'Dashboard',
        description: 'Bienvenido al panel de administración de Unitrack, el sistema de úbicación de paraderos de buses de la Universidad de los Llanos. Aquí podrás ver, editar, actualizar o borrar la información de los paraderos o de los horarios. \n \n Estos son los registros actuales:',
        icon: <BiHome/>
    },
    stop: {
        path: '/stops',
        title: 'Paraderos | Unitrack',
        name: 'Paraderos',
        description: 'Aquí puedes ver, editar, actualizar o borrar la información de los paraderos.',
        icon: <GiBusStop/>
    },
    timetable: {
        path: '/timetable',
        title: 'Horarios | Unitrack',
        name: 'Horarios',
        description: 'Aquí puedes ver, editar, actualizar o borrar la información de los horarios.',
        icon: <AiOutlineFieldTime/>
    },
    user: {
        path: '/users',
        title: 'Usuarios | Unitrack',
        name: 'Usuarios',
        description: 'Aquí puedes crear, editar, actualizar o borrar la información de los usuarios administradores.',
        icon: <AiOutlineUser/>
    },

}