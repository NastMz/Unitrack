import React from 'react';
import {Provider} from 'react-redux';
import App from './App';
import './index.css';
import {store} from './redux/store';
import {createRoot} from "react-dom/client";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";

// Create a query client to be used by the app and its components to make requests to the API and cache the responses.
const queryClient = new QueryClient();

/**
 * Renders the root React component in the DOM.
 *
 * @param {HTMLElement} rootElement - The root element to render the component in.
 */
function render(rootElement: any) {
    createRoot(rootElement).render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                        <App/>
                        <ReactQueryDevtools/>
                </Provider>
            </QueryClientProvider>
        </React.StrictMode>,
    );
}

render(document.getElementById('root'));
