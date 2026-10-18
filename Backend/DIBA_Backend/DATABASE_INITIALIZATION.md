# DIBA Bookings database initialization

## What changed

- The API no longer runs EF Core migrations automatically when it starts.
- The demo-data seeder has been removed. Starting the API will not create demo users, venues, events, bookings, payments, FAQs or policy documents.
- EF Core migrations and the model snapshot are retained. Roles and booking statuses are model-managed data and are inserted by the migrations.
- FAQs and policy documents can be created by authorised Staff or Administrators through the existing management endpoints.

## 1. Configure the database connection

Configure `ConnectionStrings:DbConn` using the deployment environment's secret/configuration facility (the environment-variable key is `ConnectionStrings__DbConn`). Do not commit production credentials to `appsettings.json`.

## 2. Apply migrations explicitly

From `Backend/DIBA_Backend/DIBA_Backend`, after configuring the intended connection string, run:

```powershell
dotnet ef database update --project DIBA_Backend.csproj --startup-project DIBA_Backend.csproj
```

Review the target connection before running this command. It creates/updates the schema; it does not populate demonstration records. Keep the existing migration files and model snapshot.

## 3. Create the first administrator

Public registration only creates Event Organiser accounts, and administrator user management requires an existing Administrator. For first-time provisioning, configure a temporary, randomly generated `Bootstrap:Secret` using the deployment environment (environment-variable key: `Bootstrap__Secret`). Never put this secret in source control, a URL, or application logs.

Generate a secret locally in PowerShell, for example:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Set the generated value as `Bootstrap__Secret` in the API's environment. Over HTTPS, make one POST request to `/api/BootstrapAdmin`, sending the secret in the `X-Bootstrap-Secret` header and the administrator details as JSON:

```json
{
  "firstName": "First",
  "lastName": "Administrator",
  "email": "admin@your-approved-domain.example",
  "password": "Use-A-Unique-Strong-Password-Here"
}
```

Use the real authorised administrator's details and a unique password; the values above are placeholders, not an account to use. The endpoint only works when the secret is configured and no Administrator account exists. It rate-limits requests, hashes the password with BCrypt, and refuses to create a second Administrator through this setup route.

**Immediately remove `Bootstrap__Secret` from the environment and restart/redeploy the API after the first administrator is created.** The endpoint then returns not found because the secret is no longer configured. Confirm that normal login works before proceeding.

After logging in as the new administrator, use the existing administration functions to create Staff and Event Organiser accounts. Staff or Administrators can then add the approved venue records, FAQs and official policy documents. Do not publish example policy wording as official university policy without approval.

## 4. Deployment checks

- Confirm the API uses the intended database and migrations have completed successfully.
- Confirm no demo accounts or sample booking records exist.
- Confirm the first administrator can sign in.
- Create real venue records and approved help/policy content before public launch.
- Verify database backups and recovery procedures before accepting real bookings or payments.
