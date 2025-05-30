import React from "react";
import App  from "./App";
import { createRoot } from 'react-dom/client';

import { DeviceThemeProvider, SSRProvider } from '@salutejs/plasma-ui';
import { GlobalStyle } from './GlobalStyle';

const container = document.getElementById('root');
const root = createRoot(container); 

root.render(
    <DeviceThemeProvider>
        <SSRProvider>
            <App />
            <GlobalStyle />
        </SSRProvider>
    </DeviceThemeProvider>,
);