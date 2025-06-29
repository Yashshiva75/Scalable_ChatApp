import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux';
import { store } from '../src/Store/index.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={QueryClient}>
    <Provider store={store}>
      <App />
    </Provider>
    </QueryClientProvider>
  </React.StrictMode>
)
