"use client"

import { useState } from "react"
import { Box, Typography, Grid, IconButton } from "@mui/material"
import { ChevronLeft, ChevronRight } from "@mui/icons-material"

const DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"]
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

export const Calendar = ({ date, onDateChange, programaciones = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(date.getMonth())
  const [currentYear, setCurrentYear] = useState(date.getFullYear())

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<Box key={`empty-${i}`} sx={{ height: 36, width: 36 }} />)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonth, day)
      const hasProgramacion = programaciones.some((prog) => {
        const progDate = new Date(prog.fecha)
        return (
          progDate.getDate() === day && progDate.getMonth() === currentMonth && progDate.getFullYear() === currentYear
        )
      })

      days.push(
        <Box
          key={`day-${day}`}
          sx={{
            height: 36,
            width: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            cursor: "pointer",
            backgroundColor: hasProgramacion ? "primary.light" : "transparent",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
          onClick={() => {
            onDateChange(new Date(currentYear, currentMonth, day))
          }}
        >
          {day}
        </Box>,
      )
    }

    return days
  }

  return (
    <Box sx={{ width: "100%", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <IconButton onClick={handlePrevMonth} size="small">
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6">
          {MONTHS[currentMonth]} {currentYear}
        </Typography>
        <IconButton onClick={handleNextMonth} size="small">
          <ChevronRight />
        </IconButton>
      </Box>

      <Grid container spacing={1}>
        {DAYS.map((day) => (
          <Grid item key={day} xs={12 / 7}>
            <Typography variant="caption" align="center" sx={{ display: "block", fontWeight: "bold" }}>
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1} sx={{ mt: 1 }}>
        {renderCalendar().map((day, index) => (
          <Grid item key={index} xs={12 / 7} sx={{ display: "flex", justifyContent: "center" }}>
            {day}
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
