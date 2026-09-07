/// <reference types="vite/client" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// TODO: Register Service Worker for offline app shell support in production mode
// window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))

// TODO: Mount React App component to #root DOM element
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
