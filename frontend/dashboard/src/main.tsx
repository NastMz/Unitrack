import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {BrowserRouter} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {store} from "./redux/store";
import {Provider} from "react-redux";

// Create a query client to be used by the app and its components to make requests to the API and cache the responses.
const queryClient = new QueryClient();

/**
 * Renders the root React component in the DOM.
 *
 * @param {HTMLElement} rootElement - The root element to render the component in.
 */
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
                <BrowserRouter>
                    <App/>
                </BrowserRouter>
            </Provider>
        </QueryClientProvider>
    </React.StrictMode>
)
