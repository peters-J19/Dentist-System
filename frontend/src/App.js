// src/App.js
// Top-level route table for the whole app. AuthPage and the post-login
// transition animation sit outside the guard; everything else is nested
// under SideBar and requires an active Supabase session (see RequireAuth).
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './components/AuthPage/AuthPage';
import RequireAuth from './components/RequireAuth/RequireAuth';
import SideBar from './components/SideBar/SideBar';
import Settings from './components/SideBar/Settings/Settings';
import AddPatient from './components/SideBar/AddPatient/AddPatient';
import Appointments from './components/SideBar/Appointments/Appointments';
import ClinicalHistory from './components/SideBar/ClinicalHistory/ClinicalHistory';
import Calendar from './components/SideBar/Calendar/Calendar';
import Week from "./components/SideBar/Calendar/Week/Week";
import Month from "./components/SideBar/Calendar/Month/Month";
import Agenda from "./components/SideBar/Calendar/Agenda/Agenda";
import TransitionPageWrapper from './components/TransitionPage/TransitionPageWrapper';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/transition" element={<TransitionPageWrapper />} />
        <Route element={<RequireAuth />}>
          <Route path="/*" element={<SideBar />}>
            <Route path="Settings" element={<Settings />} />
            <Route path="ClinicalHistory" element={<ClinicalHistory />} />
            {/* Calendar is its own nested layout too, with its own <Outlet>. */}
            <Route path="Appointments" element={<Appointments />} />
            <Route path="AddPatient" element={<AddPatient />} />
            <Route path="/*" element={<Calendar />}>
              <Route path="Week" element={<Week />} />
              <Route path="Month" element={<Month />} />
              <Route path="Agenda" element={<Agenda />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
