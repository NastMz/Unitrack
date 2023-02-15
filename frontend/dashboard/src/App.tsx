import './App.css'
import {AnimatePresence} from "framer-motion";
import {ScrollToTop} from "./utils";
import {Route, Routes} from "react-router-dom";
import {Main} from "./components/templates";
import {Dashboard, NotFound, StopPage, TimetablePage} from "./components/pages";
import {routes} from "./config/routes";

function App() {

    return (
        <div>
            <ScrollToTop/>
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
                                pageName={routes.timetable.name}
                            />
                        }
                    />
                </Routes>
            </AnimatePresence>
        </div>
    )
}

export default App
