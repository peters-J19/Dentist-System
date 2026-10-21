# Dentist System

A management app for a dental clinic, with a Spanish-language interface. **Work in progress.**

React frontend and Express API, both backed by the same Supabase PostgreSQL database.

## What works so far

- **Login** with Supabase Auth. Every page behind the login sends you back to it if there's no session.
- **Ficha Clinica** (patient record): search patients from a cached list, load a full record, and edit personal details, contact info and notes in place. Age is calculated live from the date of birth rather than stored. Saving changes isn't wired up yet.
- **Añadir Paciente**: create a new patient through the API.
- **Calendar**: month view. The week and agenda views are placeholders.
- Collapsible sidebar navigation.

## How it's built

- **Two data paths.** The frontend talks to Supabase directly for authentication, and to the Express API for patient data, which runs plain SQL through `pg`.
- **One shared patient list.** It's fetched once when the app loads and passed to every page through React Router's outlet context, so pages don't refetch it.
- **Dates stay as dates.** Postgres `date` columns come back as plain `YYYY-MM-DD` strings. By default, the `pg` driver converts them to JavaScript dates in the server's local time zone, which shifted birth dates by a day depending on where the backend was running.

## Next up

- Saving on the patient record page
- Appointments (Citas)
- An interactive odontogram (tooth chart)
- Week and agenda calendar views

## Running locally

You'll need Node.js and a Supabase project. The database schema isn't in the repo yet.

```bash
# Backend (port 5000)
cd backend
npm install
# backend/.env: DB_USER, DB_HOST, DB_NAME, DB_PASS, DB_PORT
npm run dev

# Frontend (port 3000)
cd frontend
npm install
# frontend/.env: REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY
npm start
```
