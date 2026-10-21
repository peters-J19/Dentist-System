// Layout shell shared by the Week/Month/Agenda calendar views: the nav row
// (today/prev/next, date label, date picker, view switcher) lives here, and
// the active view renders in the Outlet below with the selected date passed
// down via context. Only the Month grid is actually built out so far.
import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import DatePickerPopup from "./DatePickerPopup/DatePickerPopup";
import toothLogo from "../../../assets/dentist-logo-inv-blck.png";
import lettersImage from "../../../assets/letters-img-inv-blck.png";
import "./Calendar.css";

const Calendar = () => {
  const location = useLocation();
  const isWeek = location.pathname.includes("/Week");
  const isMonth = location.pathname.includes("/Month");
  const isAgenda = location.pathname.includes("/Agenda");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateButtonRef = useRef(null);
  const popupRef = useRef(null);
  const spanishMonths = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Close the date picker popup on any click outside it or its trigger button.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        dateButtonRef.current &&
        !dateButtonRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
    };
  
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleTodayClick = () => {
    setSelectedDate(new Date());
  };

  // Prev/next step by a month in Month view, otherwise by a week.
  const handlePrevClick = () => {
    const newDate = new Date(selectedDate);
    if (isMonth) {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setSelectedDate(newDate);
  };
  
  const handleNextClick = () => {
    const newDate = new Date(selectedDate);
    if (isMonth) {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedDate(newDate);
  };

  // Header label format depends on which view is active: a month/year, a
  // week range starting Monday, or a rolling 7-day range for Agenda.
  const getDateLabel = () => {
    const year = selectedDate.getFullYear();
    const monthIndex = selectedDate.getMonth();
    const monthName = spanishMonths[monthIndex];
  
    if (isMonth) {
      return `${monthName} ${year}`;
    }
  
    if (isWeek) {
      // Start from Monday
      const startOfWeek = new Date(selectedDate);
      const day = startOfWeek.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
  
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
  
      const startDay = startOfWeek.getDate();
      const endDay = endOfWeek.getDate();
      const startMonthAbbr = spanishMonths[startOfWeek.getMonth()].slice(0, 3);
      const endMonthAbbr = spanishMonths[endOfWeek.getMonth()].slice(0, 3);
  
      return `${startMonthAbbr} ${startDay} - ${endMonthAbbr} ${endDay}, ${year}`;
    }

    if (isAgenda) {
      // Start from selectedDate
      const startDate = new Date(selectedDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
  
      const startDay = startDate.getDate();
      const endDay = endDate.getDate();
      const startMonthAbbr = spanishMonths[startDate.getMonth()].slice(0, 3);
      const endMonthAbbr = spanishMonths[endDate.getMonth()].slice(0, 3);
  
      return `${startMonthAbbr} ${startDay} - ${endMonthAbbr} ${endDay}, ${year}`;
    }
  
    return "";
  };

  return (
    <div className="calendar-container">
      {/* Fixed top-right logo, sized/positioned to match the transition
          animation's end state so login lands here without a visible jump
          (Calendar replaced Dashboard as the landing page). */}
      <div className="calendar-logo-header">
        <img src={toothLogo} alt="Logo" className="calendar-tooth-logo" />
        <img src={lettersImage} alt="Letters" className="calendar-letters-logo" />
      </div>

      <div className="calendar-main">
        <div className="calendar-nav-row">
          <div className="left-buttons">
            <button className="calendar-btn today" onClick={handleTodayClick}>
              Hoy
            </button>
            <button className="calendar-btn arrow arrow-left" onClick={handlePrevClick}>
              <FaArrowLeftLong />
            </button>
            <button className="calendar-btn arrow arrow-right" onClick={handleNextClick}>
              <FaArrowRightLong />
            </button>
            <div className="datepicker-container">
              <button
                className="calendar-btn date"
                onClick={() => setShowDatePicker(!showDatePicker)}
                ref={dateButtonRef}
              >
                {getDateLabel()}
              </button>
              {showDatePicker && (
                <div style={{ position: 'relative' }} ref={popupRef}>
                  <DatePickerPopup
                    selectedDate={selectedDate}
                    onSelectDate={handleDateSelect}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="right-buttons">
            <NavLink
              to="/Week"
              className={({ isActive }) =>
                isActive ? "calendar-btn section active" : "calendar-btn section"
              }
            >
              Semana
            </NavLink>
            <NavLink
              to="/Month"
              className={({ isActive }) =>
                isActive ? "calendar-btn section active" : "calendar-btn section"
              }
            >
              Mes
            </NavLink>
            <NavLink
              to="/Agenda"
              className={({ isActive }) =>
                isActive ? "calendar-btn section active" : "calendar-btn section"
              }
            >
              Agenda
            </NavLink>
            <button className="calendar-btn new-event">+</button>
          </div>
        </div>
        <div className="calendar-view">
          <Outlet context={{ selectedDate }} />
        </div>
      </div>
      <div className="calendar-extra-info">
        Extra Info
      </div>
    </div>
  );
};

export default Calendar;