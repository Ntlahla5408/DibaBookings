# DIBA Bookings password recovery setup

Password recovery uses the existing SQL Server user records and the existing Brevo email-delivery service. It does not add a database table or require an EF Core migration.

## Required configuration

Configure these values in ASP.NET Core User Secrets for local development, or as environment variables in the deployed API. Do not commit API keys or the JWT signing key.

| Configuration key | Purpose |
| --- | --- |
| `Jwt:Key` | Existing JWT signing key; must be configured with a strong secret |
| `Jwt:Issuer` | Issuer used to sign and validate reset tokens |
| `Jwt:Audience` | Audience used to sign and validate reset tokens |
| `Frontend:BaseUrl` | Public frontend origin, e.g. `http://localhost:3000` locally |
| `Email:Enabled` | Set to `true` to enable Brevo delivery |
| `Email:Provider` | Set to `Brevo` |
| `Email:Brevo:ApiKey` | Brevo transactional email API key |
| `Email:FromAddress` | Verified sender email address in Brevo |
| `Email:FromName` | Optional sender name; defaults to DIBA Bookings |

For production, set `Frontend:BaseUrl` to the real HTTPS frontend origin. Do not leave it pointing at localhost.

## How the flow works

1. The user submits an email address at `/forgot-password`.
2. The API returns the same public response whether or not an active account exists.
3. For an active account, the API emails a signed reset link that expires after 30 minutes.
4. The user chooses a new password at `/reset-password`.
5. The API validates the signature, issuer, audience, expiry and reset purpose before updating the BCrypt password hash.
6. A password-hash fingerprint in the signed token invalidates reset tokens after a successful password change. No reset token is stored in the database.

Email delivery follows the existing `Email:Enabled` and Brevo settings. Delivery failures are recorded by the existing `EmailDeliveryLogs` infrastructure; the public response intentionally does not disclose whether an account exists.

## Verification checklist

- [ ] Request recovery for an active account and confirm the email arrives.
- [ ] Request recovery for an unknown email and confirm the response is identical.
- [ ] Confirm the link opens the deployed frontend, not localhost.
- [ ] Reset with a valid link and sign in with the new password.
- [ ] Reuse the same link and confirm it is rejected.
- [ ] Use a link after 30 minutes and confirm it is rejected.
- [ ] Try a malformed token and a weak password.
- [ ] Confirm an inactive account does not receive a reset email.
- [ ] Confirm registration still assigns Event Organiser on the server.
