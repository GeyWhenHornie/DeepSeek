import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Optional: Add global styles
import App from './App'; // Import the root App component

// Render the App component into the root DOM node
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
