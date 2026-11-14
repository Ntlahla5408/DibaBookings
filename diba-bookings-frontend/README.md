# DIBA Bookings frontend

This is the React frontend for the DIBA Bookings conference-centre booking system.

## Requirements

- Node.js
- npm
- The DIBA Bookings ASP.NET Core API running locally or deployed to an accessible environment

## Install and run

From this directory:

```bash
npm install
npm start
```

The project uses Create React App through `react-scripts`. The development server starts the frontend locally.

## API configuration

The API client reads `REACT_APP_API_BASE_URL`. If it is not set, the client defaults to:

```text
https://localhost:7054/api
```

To use another API origin, create a local `.env` file in this directory:

```env
REACT_APP_API_BASE_URL=https://localhost:7054/api
```

Restart the development server after changing environment variables. Do not commit local environment files or credentials.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start the local development server |
| `npm test -- --watchAll=false` | Run the test suite once |
| `npm run build` | Create an optimised production build |

## Application areas

The frontend includes authentication and password recovery pages, role-oriented dashboards, booking and venue services, notifications, payment return pages, policy information and a help centre.

The backend remains responsible for enforcing authentication and authorisation. Hiding frontend controls is not a substitute for API-side permission checks.

For full system setup, backend configuration and project status, see the [repository README](../README.md) and [project integration guide](../Documentation/DIBA_PROJECT_AND_INTEGRATION_GUIDE.md).
