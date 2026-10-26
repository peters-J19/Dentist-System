# Dentist System

A practice management app I'm building for a friend who runs a dental practice. Their patient records, appointments and billing notes currently live on paper, and the goal is to move them into a clear, easy-to-use interface that the whole practice can rely on. The interface is in Spanish.

**Status: about halfway through.** The login, calendar and patient record screens are in place; the odontogram, appointments and settings are still to come (details below).

<table>
  <tr>
    <td width="33%"><img src="screenshots/welcome.png" alt="Welcome screen" /><br /><sub>Welcome screen after login</sub></td>
    <td width="33%"><img src="screenshots/calendar.png" alt="Calendar, month view" /><br /><sub>Calendar, month view</sub></td>
    <td width="33%"><img src="screenshots/patient-record.png" alt="Patient record" /><br /><sub>Patient record (Ficha Clínica)</sub></td>
  </tr>
</table>

## What's built

- **Login.** Authentication through Supabase Auth. Every page behind the login redirects back to it when there's no session, and an already signed-in user skips the login form.
- **Calendar.** A month view with Today, previous and next controls and a Week / Month / Agenda switcher.
- **Patient record (Ficha Clínica).** Search for a patient, load their full record, and edit their personal details, contact information and notes in place. Age is calculated from the date of birth instead of being stored, and billing totals and balance are shown alongside.
- **New patients.** A form to add a patient through the API.
- **Navigation.** A collapsible sidebar shared by every page.

## What's next

- Saving changes from the patient record page, and deleting patients
- An interactive **odontogram**, the tooth chart each patient's dental history is recorded on
- **Appointments (Citas):** scheduling, search by date, and appointment blocks on the calendar
- Week and agenda calendar views
- A settings page
- **Securing the API** before it handles real patient data. Right now login protects the pages in the app, but the API itself doesn't check who is calling it yet. The plan is to verify the Supabase session on the backend and add row-level security in the database.

## How it's built

React frontend and Express API, both backed by the same Supabase PostgreSQL database.

- **Two data paths.** The frontend talks to Supabase directly for authentication, and to the Express API for patient data, which runs parameterized SQL through `pg`.
- **One shared patient list.** The list is fetched once when the app loads and passed to every page through React Router's outlet context, so pages don't refetch it.
- **Dates stay as dates.** Postgres `date` columns come back as plain `YYYY-MM-DD` strings. By default, the `pg` driver converts them to JavaScript dates in the server's local time zone, which shifted birth dates by a day depending on where the backend was running.

**Tech:** React 19, React Router 7, Supabase (Auth and PostgreSQL), Express 5, Node.js, `pg`.

This is a private project for the practice, so it isn't deployed and isn't meant to be run by others. The repo is here to show the code.
