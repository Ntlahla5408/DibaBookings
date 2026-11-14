# DIBA Bookings

DIBA Bookings is a Nelson Mandela University project focused on managing conference-centre venue booking requests. It provides a web application for event organisers to submit and track requests, with staff and administrator workflows for reviewing and managing bookings.

> **Project status:** This repository contains an integrated application codebase, but a successful build is not proof that every workflow is production-ready. The current project guide records areas that still require end-to-end, database, security and deployment verification. See [the project and integration guide](Documentation/DIBA_PROJECT_AND_INTEGRATION_GUIDE.md).

## Main capabilities represented in the codebase

- Account registration, login and JWT-based authentication.
- Role-oriented experiences for Event Organisers, Staff and Administrators.
- Venue and booking-related workflows.
- Booking, event, profile, notification and payment service modules in the frontend.
- Policy information, help centre and password recovery pages.
- ASP.NET Core Web API with Entity Framework Core and SQL Server.

The list describes capabilities represented in the repository; verify each workflow in the intended environment before treating it as complete.

## Technology stack

| Area | Technologies |
| --- | --- |
| Backend | C#, ASP.NET Core Web API, .NET 8 |
| Data access | Entity Framework Core |
| Database | Microsoft SQL Server |
| Authentication | JWT bearer authentication |
| Frontend | React, React Router, Bootstrap |
| HTTP | Axios |
| API documentation | Swagger / OpenAPI |

## Repository layout

```text
Backend/
  DIBA_Backend/
    DIBA_Backend/
      Controllers/
      Data/
      Dto/
      Models/
      Services/
      Migrations/
      DIBA_Backend.csproj
diba-bookings-frontend/
  src/
    components/
    hooks/
    pages/
    services/
    styles/
Documentation/
  DIBA_PROJECT_AND_INTEGRATION_GUIDE.md
PASSWORD_RECOVERY_SETUP.md
```

The active frontend package is in `diba-bookings-frontend/`; the backend project file is in `Backend/DIBA_Backend/DIBA_Backend/`.

## Prerequisites

- .NET 8 SDK
- Node.js and npm
- SQL Server instance accessible from your development machine
- Git

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/Ntlahla5408/DibaBookings.git
cd DibaBookings
```

### 2. Configure the backend

The API reads its SQL Server connection string from `ConnectionStrings:DbConn`.

For local development, use .NET User Secrets rather than committing credentials:

```bash
cd Backend/DIBA_Backend/DIBA_Backend
dotnet user-secrets set "ConnectionStrings:DbConn" "Server=YOUR_SERVER;Database=YOUR_DATABASE;Trusted_Connection=True;TrustServerCertificate=True;"
dotnet restore
dotnet run
```

Replace the example connection string with the connection details for your own local SQL Server instance. Configure JWT issuer, audience and signing key, and any email-provider settings through User Secrets or environment variables as described in [Password recovery setup](PASSWORD_RECOVERY_SETUP.md). Never commit database passwords, JWT keys or provider API keys.

The frontend currently defaults to `https://localhost:7054/api` when `REACT_APP_API_BASE_URL` is not set. Set that variable in the frontend environment if your API uses a different URL.

### 3. Configure and run the frontend

Open a second terminal from the repository root:

```bash
cd diba-bookings-frontend
npm install
npm start
```

To point the frontend at a different API origin, create a local `.env` file in `diba-bookings-frontend/`:

```env
REACT_APP_API_BASE_URL=https://localhost:7054/api
```

Do not commit local environment files or secrets.

## Database and migrations

The backend uses SQL Server and Entity Framework Core. Review the database initialization notes in [Backend/DIBA_Backend/DATABASE_INITIALIZATION.md](Backend/DIBA_Backend/DATABASE_INITIALIZATION.md) and the integration guide before changing the schema.

Do not apply migrations to a shared or production database without confirming the target connection, reviewing the migration, and taking an appropriate backup. A migration file existing in the repository does not mean it has been applied to every database.

## Verification

Run the frontend checks from `diba-bookings-frontend/`:

```bash
npm test -- --watchAll=false
npm run build
```

Build the backend from the repository root:

```bash
dotnet build Backend/DIBA_Backend/DIBA_Backend/DIBA_Backend.csproj
```

These commands verify compilation/build and the available automated frontend tests. They do not replace end-to-end checks for authentication, role permissions, booking persistence, venue conflict detection, notifications, payment handling or deployment.

## Further documentation

- [Project and integration guide](Documentation/DIBA_PROJECT_AND_INTEGRATION_GUIDE.md) — repository history, verified checks, current risks and recommended next work.
- [Database initialization](Backend/DIBA_Backend/DATABASE_INITIALIZATION.md) — database setup guidance.
- [Email notifications](Backend/DIBA_Backend/EMAIL_NOTIFICATIONS.md) — email configuration and behaviour.
- [Password recovery setup](PASSWORD_RECOVERY_SETUP.md) — JWT and Brevo configuration and verification checklist.

## Contribution and safe change practices

- Work on a feature branch and open a pull request for review.
- Do not commit secrets, generated build output, local IDE files or machine-specific configuration.
- Do not rewrite shared Git history or force-push without team agreement.
- Review database changes and target environments before applying migrations.
- Update this README and the project guide when setup instructions or verified project status changes.
