# DIBA Bookings email notifications

DIBA sends transactional emails through Brevo using `NotificationEmailService`.
Email delivery is disabled unless `Email:Enabled` is explicitly set to `true`.
Do not commit API keys, database passwords, JWT signing keys, or real credentials.

## Required configuration

Configure these values through .NET user-secrets for local development or environment variables / the deployment secret store on the university IIS server.

| Configuration key | Environment variable | Purpose |
|---|---|---|
| `Email:Enabled` | `Email__Enabled` | Set to `true` to enable email delivery |
| `Email:Provider` | `Email__Provider` | Set to `Brevo` |
| `Email:Brevo:ApiKey` | `Email__Brevo__ApiKey` | Brevo transactional email API key |
| `Email:FromAddress` | `Email__FromAddress` | Verified sender address in Brevo |
| `Email:FromName` | `Email__FromName` | Sender display name, e.g. `DIBA Bookings` |

The sender address must be verified in Brevo. Keep the API key in user-secrets or deployment configuration, never in source control.

## Local development setup

Run these commands from the backend project directory, replacing the placeholder with the real key locally. Do not paste the real key into source files or commit it.

```powershell
dotnet user-secrets set "Email:Enabled" "true"
dotnet user-secrets set "Email:Provider" "Brevo"
dotnet user-secrets set "Email:Brevo:ApiKey" "<your-Brevo-API-key>"
dotnet user-secrets set "Email:FromAddress" "<your-verified-sender-address>"
dotnet user-secrets set "Email:FromName" "DIBA Bookings"
```

## Notification behaviour

- A submitted booking sends an acknowledgement to the organiser and creates in-app notifications for active Staff and Administrator accounts.
- Staff and Administrators receive an email for new booking requests, organiser edits to pending bookings, and organiser-initiated cancellations.
- Approval and rejection emails include the booking reference, event, venue, schedule and relevant decision details.
- Each email attempt is recorded in `EmailDeliveryLogs` as `Sent`, `Failed`, or `Skipped`.
- An email provider accepting a message is not proof that the recipient opened or read it. Check provider delivery information when available.
- If email settings are absent or email is disabled, in-app notifications are still saved and the email attempt is logged as skipped.

## Deployment verification checklist

1. Configure the values above in the deployment environment without committing secrets.
2. Restart the application pool / application so configuration is reloaded.
3. Submit a test booking with an organiser account.
4. Confirm the organiser receives the acknowledgement and the active Staff / Administrator accounts receive in-app notifications.
5. Check the recipient inboxes and spam folders for the staff emails.
6. Inspect the administrator's email-delivery log for `Sent`, `Failed`, or `Skipped` outcomes and investigate any error details.
