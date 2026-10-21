// Standard CRA entry point — just mounts <App /> into the page.
import React from 'react';
import ReactDOM from 'react-dom/client'; // Changed import
import './index.css';
import App from './App';

// Create a root for rendering the app in React 18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);