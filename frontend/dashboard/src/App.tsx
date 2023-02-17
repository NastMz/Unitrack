import './App.css'
import {AnimatePresence} from "framer-motion";
import {Route, Routes} from "react-router-dom";
import {Main} from "./components/templates";
import {Dashboard, Login, NotFound, StopPage, TimetablePage} from "./components/pages";
import {routes} from "./config/routes";
import {UserPage} from "./components/pages/UserPage";
import {ProtectedRoute} from "./components/utils";

function App() {
    return (
        <div className={'max-h-screen max-w-screen overflow-hidden'}>
            <AnimatePresence>
                <Routes location={location} key={location.pathname}>
                    <Route
                        path={"*"}
                        element={<NotFound/>}
                    />
                    <Route
                        path={routes.login.path}
                        element={
                            <Login/>
                        }
                    />
                    <Route
                        path={routes.home.path}
                        element={
                            <ProtectedRoute>
                                <Main
                                    page={<Dashboard/>}
                                    title={routes.home.title}
                                    description={routes.home.description}
                                    pageName={routes.home.name}
                                />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={routes.stop.path}
                        element={
                            <ProtectedRoute>
                                <Main
                                    page={<StopPage/>}
                                    title={routes.stop.title}
                                    description={routes.stop.description}
                                    pageName={routes.stop.name}
                                />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={routes.timetable.path}
                        element={
                            <ProtectedRoute>
                                <Main
                                    page={<TimetablePage/>}
                                    title={routes.timetable.title}
                                    description={routes.timetable.description}
                                    pageName={routes.timetable.name}
                                />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={routes.user.path}
                        element={
                            <ProtectedRoute>
                                <Main
                                    page={<UserPage/>}
                                    title={routes.user.title}
                                    description={routes.user.description}
                                    pageName={routes.user.name}
                                />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AnimatePresence>
        </div>
    )
}

export default App
