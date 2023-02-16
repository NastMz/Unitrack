import {motion} from "framer-motion";
import {DashboardCard} from "../common";
import {routes} from "../../config/routes";
import {useNavigate} from "react-router-dom";
import {store} from "../../redux/store";
import {useState} from "react";

export const Dashboard = () => {

    const navigate = useNavigate();

    const [timetablesCount, setTimetablesCount] = useState(0);

    const [usersCount, setUsersCount] = useState(0);

    const [stopsCount, setStopsCount] = useState(0);

    store.subscribe(() => {
        setTimetablesCount(store.getState().timetables.list.length);
        setUsersCount(store.getState().users.list.length);
        setStopsCount(store.getState().stops.list.length);
    })

    return (
        <div
            className={'h-full w-full p-8'}
        >
            <div className={'flex gap-8 items-center justify-center'}>
                <motion.div
                    initial={{y: 100, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    transition={{delay: 0.1, duration: 0.3}}
                >
                    <DashboardCard
                        icon={routes.user.icon}
                        count={usersCount}
                        title={routes.user.name}
                        bgColor={'#22d3ee'}
                        onClick={() => navigate(routes.user.path)}
                    />
                </motion.div>
                <motion.div
                    initial={{y: 100, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    transition={{delay: 0.2, duration: 0.3}}
                >
                    <DashboardCard
                        icon={routes.stop.icon}
                        count={stopsCount} title={routes.stop.name}
                        bgColor={'#60a5fa'}
                        onClick={() => navigate(routes.stop.path)}
                    />
                </motion.div>
                <motion.div
                    initial={{y: 100, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    transition={{delay: 0.3, duration: 0.3}}
                >
                    <DashboardCard
                        icon={routes.timetable.icon}
                        count={timetablesCount}
                        title={routes.timetable.name}
                        bgColor={'#c084fc'}
                        onClick={() => navigate(routes.timetable.path)}
                    />
                </motion.div>
            </div>
        </div>
    )
}