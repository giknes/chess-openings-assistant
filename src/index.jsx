import React from "react";
import { App } from "./App";
import { createRoot } from 'react-dom/client';

import { DeviceThemeProvider, SSRProvider } from '@salutejs/plasma-ui';
import { GlobalStyle } from './GlobalStyle.tsx';

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript

root.render(
    <DeviceThemeProvider>
        <SSRProvider>
            <App />
            <GlobalStyle />
        </SSRProvider>
    </DeviceThemeProvider>,
);


//
// Developer Console triggers rerender in React Strict Mode while in 'development'
//
// More info:                                                                     
// - https://stackoverflow.com/questions/61521734/why-does-my-create-react-app-console-log-twice
// - https://stackoverflow.com/questions/61328285/react-component-rendering-twice-when-using-usestate-hook
//
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

