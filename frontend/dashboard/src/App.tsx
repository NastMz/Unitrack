import './App.css'
import {AnimatePresence} from "framer-motion";
import {Route, Routes} from "react-router-dom";
import {Main} from "./components/templates";
import {Dashboard, NotFound, StopPage, TimetablePage} from "./components/pages";
import {routes} from "./config/routes";
import {UserPage} from "./components/pages/UserPage";
import {useQuery} from "@tanstack/react-query";
import {getUsers} from "./api";
import {User} from "./models/interfaces";
import {addUser} from "./redux/actions";
import {useDispatch} from "react-redux";

function App() {

    const dispatch = useDispatch();

    useQuery({
        queryKey: ['apiUsers'],
        queryFn: getUsers,
        onSuccess: (response) => {
                response.data.users.forEach((user: User) => {
                    dispatch(addUser(user));
                });
        }
    })

    return (
        <div className={'max-h-screen max-w-screen overflow-hidden'}>
            <AnimatePresence>
                <Routes location={location} key={location.pathname}>
                    <Route
                        path={"*"}
                        element={<NotFound/>}
                    />
                    <Route
                        path={routes.home.path}
                        element={
                            <Main
                                page={<Dashboard/>}
                                title={routes.home.title}
                                description={routes.home.description}
                                pageName={routes.home.name}
                            />
                        }
                    />
                    <Route
                        path={routes.stop.path}
                        element={
                            <Main
                                page={<StopPage/>}
                                title={routes.stop.title}
                                description={routes.stop.description}
                                pageName={routes.stop.name}
                            />
                        }
                    />
                    <Route
                        path={routes.timetable.path}
                        element={
                            <Main
                                page={<TimetablePage/>}
                                title={routes.timetable.title}
                                description={routes.timetable.description}
                                pageName={routes.timetable.name}
                            />
                        }
                    />
                    <Route
                        path={routes.user.path}
                        element={
                            <Main
                                page={<UserPage/>}
                                title={routes.user.title}
                                description={routes.user.description}
                                pageName={routes.user.name}
                            />
                        }
                    />
                </Routes>
            </AnimatePresence>
        </div>
    )
}

export default App
