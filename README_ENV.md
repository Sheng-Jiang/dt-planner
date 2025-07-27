# Environment Variables for Digital Transformation Planner

This project requires the following environment variables to be set for proper operation. Copy `.env.example` to `.env` and fill in the values as needed.

## Required Variables

| Variable         | Description                                      | Example Value                                 |
|------------------|--------------------------------------------------|-----------------------------------------------|
| `JWT_SECRET`     | Secret key for signing JWT tokens. **Required for production!** | `your-super-secure-jwt-secret-key-change-this-in-production` |
| `DATABASE_URL`   | Path or URL to the user database (JSON file).    | `./data/users.json`                           |
| `NEXTAUTH_URL`   | The base URL of your application.                | `http://localhost:3000`                       |
| `NEXTAUTH_SECRET`| Secret for NextAuth (if used).                   | `your-nextauth-secret-key-change-this-in-production` |

## Setup Instructions

1. Copy the example file:
   ```sh
   cp .env.example .env
   ```
2. Edit `.env` and set strong, unique secrets for all secret keys before deploying to production.
3. Never commit your real `.env` file to version control.

## Security Note
- **Never use the default or example secrets in production.**
- Store your `.env` file securely and restrict access.

---
For more details, see the `.env.example` file in the project root.
