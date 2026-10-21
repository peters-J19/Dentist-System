// Small month-grid popup used by Calendar.js's date button to jump to any
// date; independent of the currently selected calendar view.
import React, { useState } from 'react';
import { PiArrowCircleRight, PiArrowCircleLeft } from 'react-icons/pi';
import './DatePickerPopup.css';

const spanishMonths = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const spanishWeekdays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

const DatePickerPopup = ({ selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const handleDateClick = (day) => {
    if (day) {
      const newDate = new Date(currentMonth);
      newDate.setDate(day);
      onSelectDate(newDate);
    }
  };

  const generateCalendarDays = () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay(); // 0 (Sun) to 6 (Sat)

    // Adjusting so that Monday is the first day of the week
    const adjustedStartDay = (startDay + 6) % 7;

    const days = [];

    // Fill in the blanks for days before the first of the month
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(null);
    }

    // Fill in the days of the month
    for (let day = 1; day <= endOfMonth.getDate(); day++) {
      days.push(day);
    }

    return days;
  };

  const days = generateCalendarDays();

  return (
    <div className="datepicker-popup">
      <div className="datepicker-header">
        <button className="arrow-btn left" onClick={handlePrevMonth}>
          <PiArrowCircleLeft />
        </button>
        <span className="datepicker-title">
          {`${spanishMonths[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`}
        </span>
        <button className="arrow-btn right" onClick={handleNextMonth}>
          <PiArrowCircleRight />
        </button>
      </div>
      <div className="datepicker-weekdays">
        {spanishWeekdays.map((day, index) => (
          <div key={index} className="datepicker-weekday">
            {day}
          </div>
        ))}
      </div>
      <div className="datepicker-grid">
        {days.map((day, index) => (
          <div
            key={index}
            className={`datepicker-day ${day ? '' : 'empty'}`}
            onClick={() => handleDateClick(day)}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatePickerPopup;