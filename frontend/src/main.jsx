import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux';
import { store } from '../src/Store/index.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SocketProvider from './SocketClient/SocketProvider/SocketProvider.jsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <SocketProvider>
        <App />
      </SocketProvider>
    </Provider>
    </QueryClientProvider>
  </React.StrictMode>
)
