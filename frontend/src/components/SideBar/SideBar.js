// The persistent sidebar nav + layout shell for every page behind the auth
// guard. It also owns the lightweight patient cache (just id/name/phone),
// fetched once here and passed down to every nested route through the
// Outlet context, so pages needing a patient list/search don't each fetch
// the full patient table themselves.
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { AiOutlineSetting } from 'react-icons/ai';
import { FaUserPlus, FaNotesMedical } from 'react-icons/fa';
import { LuCalendarDays, LuCalendarClock, LuArrowRightToLine, LuArrowLeftToLine } from 'react-icons/lu';
import './SideBar.css';
import logo from '../../assets/dentist-logo-inv.png';

function SideBar() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  // New: patient cache state
  const [patientCache, setPatientCache] = useState([]);

  // New: fetch patient cache on mount
  useEffect(() => {
    async function fetchPatientCache() {
      try {
        const res = await fetch('http://localhost:5000/patients/minimal'); // Adjust your backend URL accordingly
        if (!res.ok) throw new Error('Failed to fetch patient cache');
        const data = await res.json();
        setPatientCache(data);
      } catch (error) {
        console.error('Error fetching patient cache:', error);
      }
    }
    fetchPatientCache();
  }, []);

  function addPatientToCache(newPatient) {
  setPatientCache(prev => [...prev, newPatient]);
  }

  const handleLogoClick = () => {
    navigate(0); // Refresh page
  };

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="app-layout">
      <div className={`sidebar ${expanded ? 'expanded' : ''}`}>
        {/* Logo box */}
        <div className={`logo-box ${expanded ? 'expanded' : ''}`} onClick={handleLogoClick}>
          <img src={logo} alt="Logo" className={`logo-image ${expanded ? 'expanded' : ''}`} />
        </div>

        {/* Nav icons with labels */}
        <div className="nav-top">

          <NavLink to="/Month">
            {({ isActive }) => (
              <div className={`icon-wrapper ${expanded ? 'expanded' : ''}`}>
                <LuCalendarDays className={`icon ${isActive ? 'active' : ''} ${expanded ? 'expanded' : ''}`} />
                {expanded && <span className="icon-label">Calendario</span>}
              </div>
            )}
          </NavLink>

          <NavLink to="/ClinicalHistory">
            {({ isActive }) => (
              <div className={`icon-wrapper ${expanded ? 'expanded' : ''}`}>
                <FaNotesMedical className={`icon-ficha ${isActive ? 'active' : ''} ${expanded ? 'expanded' : ''}`} />
                {expanded && <span className="icon-label">Ficha Clinica</span>}
              </div>
            )}
          </NavLink>

          <NavLink to="/Appointments">
            {({ isActive }) => (
              <div className={`icon-wrapper ${expanded ? 'expanded' : ''}`}>
                <LuCalendarClock className={`icon ${isActive ? 'active' : ''} ${expanded ? 'expanded' : ''}`} />
                {expanded && <span className="icon-label">Citas</span>}
              </div>
            )}
          </NavLink>

          <NavLink to="/AddPatient">
            {({ isActive }) => (
              <div className={`icon-wrapper ${expanded ? 'expanded' : ''}`}>
                <FaUserPlus className={`icon-small ${isActive ? 'active' : ''} ${expanded ? 'expanded' : ''}`} />
                {expanded && <span className="icon-label">Añadir Paciente</span>}
              </div>
            )}
          </NavLink>
        </div>

        <div className="nav-bottom">
          <NavLink to="/Settings">
            {({ isActive }) => (
              <div className={`icon-wrapper ${expanded ? 'expanded' : ''}`}>
                <AiOutlineSetting className={`icon ${isActive ? 'active' : ''} ${expanded ? 'expanded' : ''}`} />
                {expanded && <span className="icon-label">Ajustes</span>}
              </div>
            )}
          </NavLink>

          {/* Toggle Button */}
          <div className={`toggle-btn ${expanded ? 'expanded' : ''}`} onClick={toggleSidebar}>
            {expanded ? <LuArrowLeftToLine className="toggle-icon expanded" /> : <LuArrowRightToLine className="toggle-icon" />}
          </div>
        </div>
      </div>

      {/* Pass patientCache via Outlet context */}
      <div className={`sidebar-content ${expanded ? 'expanded' : ''}`}>
        <Outlet context={{ expanded, patientCache, addPatientToCache }} />
      </div>
    </div>
  );
}

export default SideBar;