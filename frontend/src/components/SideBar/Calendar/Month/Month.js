// Renders the Month grid: a plain calendar layout, no appointment data wired
// in yet. selectedDate comes from Calendar.js via Outlet context.
import React from "react";
import { useOutletContext } from "react-router-dom";
import "./Month.css";

const Month = () => {
  const { selectedDate } = useOutletContext();

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)

  // Adjust startDay to make Monday the first day of the week
  const adjustedStartDay = (startDay + 6) % 7;

  const totalCells = adjustedStartDay + daysInMonth;
  const weeks = [];

  for (let i = 0; i < totalCells; i += 7) {
    weeks.push(i);
  }

  const getDayLabel = (index) => {
    const labels = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    return labels[index];
  };

  return (
    <div className="month-view">
      <div className="calendar-grid">
        {/* Days of the week */}
        <div className="calendar-row calendar-header-row">
          {Array.from({ length: 7 }).map((_, index) => (
            <div className="calendar-day-of-week" key={index}>
              {getDayLabel(index)}
            </div>
          ))}
        </div>

        {/* Dates */}
        {weeks.map((startIndex, weekIndex) => (
          <div className="calendar-row" key={weekIndex}>
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const cellIndex = startIndex + dayIndex;
              const dayNum = cellIndex - adjustedStartDay + 1;
              // Leading/trailing cells that fall outside the month just render blank.
              return (
                <div className="calendar-cell" key={dayIndex}>
                  {dayNum > 0 && dayNum <= daysInMonth ? dayNum : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Month;