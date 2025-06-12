import { useState, useMemo } from "react";
import moment from "moment";
import { Box, Paper, Typography, Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";

const Calendar = ({ events, onEventClick, onDayClick }) => {
  const [date, setDate] = useState(new Date());

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const startOfMonth = moment(date).startOf("month");
    const endOfMonth = moment(date).endOf("month");
    const startDate = moment(startOfMonth).startOf("week");
    const endDate = moment(endOfMonth).endOf("week");

    const days = [];
    const day = startDate.clone();

    while (day.isSameOrBefore(endDate)) {
      days.push(day.clone());
      day.add(1, "day");
    }

    return days;
  }, [date]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = {};

    events.forEach((event) => {
      const dateKey = moment(event.start).format("YYYY-MM-DD");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [events]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Calendar Header */}
      <Box className="custom-calendar-header">
        {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((day) => (
          <Box key={day} className="custom-calendar-header-cell">
            {day}
          </Box>
        ))}
      </Box>
      
      {/* Calendar Days */}
      <Box className="custom-calendar">
        {calendarDays.map((day) => {
          const dateKey = day.format("YYYY-MM-DD");
          const dayEvents = eventsByDate[dateKey] || [];
          const isToday = day.isSame(moment(), "day");
          const isCurrentMonth = day.isSame(moment(date), "month");

          return (
            <Paper
              key={dateKey}
              className={`custom-calendar-day ${isToday ? "custom-calendar-day-today" : ""} ${
                !isCurrentMonth ? "custom-calendar-day-outside" : ""
              }`}
              onClick={() => onDayClick(day.toDate())}
            >
              {/* Day Header */}
              <Box className="custom-calendar-day-header">
                <Typography className="custom-calendar-day-number">
                  {day.format("D")}
                </Typography>
                {dayEvents.length > 0 && (
                  <Chip size="small" label={dayEvents.length} color="primary" />
                )}
              </Box>

              {/* Day Events */}
              <Box className="custom-calendar-day-content">
                {dayEvents
                  .sort((a, b) => a.start - b.start)
                  .slice(0, 5)
                  .map((event) => (
                    <Box
                      key={event.id}
                      className={`custom-calendar-event ${
                        event.status === "cancelada" ? "custom-calendar-event-cancelled" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event, e);
                      }}
                    >
                      {/* Event Content */}
                      <Box className="custom-calendar-event-title">
                        {event.title}
                      </Box>
                      <Box className="custom-calendar-event-details">
                        {moment(event.start).format("HH:mm")}
                      </Box>
                    </Box>
                  ))}
                
                {dayEvents.length > 5 && (
                  <Box
                    className="custom-calendar-more-events"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDayClick(day.toDate());
                    }}
                  >
                    +{dayEvents.length - 5} más
                  </Box>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default Calendar; // Make sure this is the only export