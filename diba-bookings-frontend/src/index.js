import React from 'react';
import ReactDOM from 'react-dom/client';

/* Vendor styles first so application styles can consistently override them. */
import "bootstrap/dist/css/bootstrap.min.css";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "react-toastify/dist/ReactToastify.css";

/* DIBA Bookings application styles */
import "./styles/global.css";
import "./styles/landing.css";
import "./styles/organizer.css";
import "./styles/dashboards.css";
import "./styles/venue-map.css";
import "./styles/dashboard-responsive.css";
import "./styles/organizer-home.css";
import "./styles/auth.css";

import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// To measure performance, pass a function such as reportWebVitals(console.log).
reportWebVitals();
