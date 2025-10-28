"use client";

import { useMemo, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, UserX, Calendar as CalendarIcon } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";

type Tutor = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

type Student = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  dayOfWeek: string;
  startTime: string;
  tutorId: string | null;
  isActive: boolean;
  tutor: Tutor | null;
};

interface CalendarViewProps {
  students: Student[];
  currentDate: Date;
  onNavigate: (newDate: Date) => void;
  onViewChange: (view: string) => void;
  onEventClick: (student: Student) => void;
}

const TUTOR_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#8b5cf6", // purple
  "#f59e0b", // orange
  "#ec4899", // pink
  "#6366f1", // indigo
  "#ef4444", // red
];

const DAY_MAP: Record<string, number> = {
  dimanche: 0,
  lundi: 1,
  mardi: 2,
  mercredi: 3,
  jeudi: 4,
  vendredi: 5,
  samedi: 6,
};

export function CalendarView({ students, currentDate, onNavigate, onViewChange, onEventClick }: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);

  const events = useMemo(() => {
    if (!students || students.length === 0) return [];

    return students.flatMap((student, index) => {
      try {
        const dayOfWeek = DAY_MAP[student.dayOfWeek];
        if (dayOfWeek === undefined) return [];

        // Parse time
        const [hours, minutes] = student.startTime.split(":").map(Number);
        if (isNaN(hours) || isNaN(minutes)) return [];

        // Create recurring events for the current month
        const events: EventInput[] = [];
        const today = new Date(currentDate);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Generate events for each week in the month
        for (let date = new Date(startOfMonth); date <= endOfMonth; date.setDate(date.getDate() + 1)) {
          if (date.getDay() === dayOfWeek) {
            const eventDate = new Date(date);
            eventDate.setHours(hours, minutes, 0, 0);
            
            const endDate = new Date(eventDate);
            endDate.setHours(endDate.getHours() + 1);

            const color = student.tutor
              ? TUTOR_COLORS[index % TUTOR_COLORS.length]
              : "#6b7280";

            events.push({
              id: `${student.id}-${eventDate.getTime()}`,
              title: student.fullName,
              start: eventDate,
              end: endDate,
              backgroundColor: student.isActive ? color : "#e5e7eb",
              borderColor: student.isActive ? color : "#9ca3af",
              textColor: student.isActive ? "#ffffff" : "#6b7280",
              extendedProps: {
                student,
                tutor: student.tutor,
                isActive: student.isActive,
                phone: student.phone,
                email: student.email,
              },
            });
          }
        }

        return events;
      } catch (error) {
        console.error("Error creating calendar event for student:", student.fullName, error);
        return [];
      }
    });
  }, [students, currentDate]);

  useEffect(() => {
    if (calendarRef.current) {
      const calendar = calendarRef.current.getApi();
      const currentCalendarDate = calendar.getDate();
      const targetDate = new Date(currentDate);
      
      // Only update if the dates are different (avoid infinite loop)
      if (currentCalendarDate.getTime() !== targetDate.getTime()) {
        calendar.gotoDate(targetDate);
      }
    }
  }, [currentDate]);

  const handleDateChange = (info: any) => {
    const newDate = info.view.calendar.getDate();
    const currentDateObj = new Date(currentDate);
    
    // Only call onNavigate if the date actually changed
    if (newDate.getTime() !== currentDateObj.getTime()) {
      onNavigate(newDate);
    }
  };

  const handleViewChange = (info: any) => {
    onViewChange(info.view.type);
  };

  const handleEventClick = (info: any) => {
    const student = info.event.extendedProps.student;
    if (student) {
      onEventClick(student);
    }
  };

  if (!students || students.length === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <CalendarIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-neutral-900 mb-2">Aucune session</p>
          <p className="text-neutral-500">Aucune session trouvée pour cette période</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px]">
      <style jsx global>{`
        .fc {
          font-family: inherit;
          border: none;
        }
        
        .fc-toolbar {
          margin-bottom: 1.5rem;
          padding: 0.75rem;
          background: white;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        }
        
        .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }
        
        .fc-button {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-weight: 600;
          color: #374151;
          transition: all 0.2s;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        }
        
        .fc-button:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }
        
        .fc-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
        }
        
        .fc-button-primary:not(:disabled):active,
        .fc-button-primary:not(:disabled).fc-button-active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
        
        .fc-daygrid-day {
          border: 1px solid #f3f4f6;
        }
        
        .fc-daygrid-day-number {
          padding: 0.5rem;
          font-weight: 600;
          color: #374151;
        }
        
        .fc-day-today {
          background-color: #f0f9ff;
        }
        
        .fc-day-today .fc-daygrid-day-number {
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0.25rem;
        }
        
        .fc-daygrid-event {
          border-radius: 6px;
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0.125rem;
          border: none;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        
        .fc-daygrid-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        
        .fc-daygrid-event-title {
          font-weight: 700;
        }
        
        .fc-daygrid-event-time {
          font-size: 0.75rem;
          opacity: 0.9;
        }
        
        .fc-col-header-cell {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          padding: 0.75rem 0.5rem;
          font-weight: 700;
          color: #374151;
        }
        
        .fc-scrollgrid {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .fc-scrollgrid-sync-table {
          border-radius: 12px;
        }
        
        .fc-daygrid-body {
          background: white;
        }
        
        .fc-daygrid-day-frame {
          min-height: 6rem;
        }
        
        .fc-daygrid-day-events {
          margin: 0.25rem;
        }
        
        .fc-event-title-container {
          padding: 0.25rem 0.5rem;
        }
        
        .fc-event-title {
          font-weight: 700;
          font-size: 0.875rem;
        }
        
        .fc-event-time {
          font-size: 0.75rem;
          opacity: 0.9;
        }
      `}</style>
      
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        events={events}
        eventClick={handleEventClick}
        datesSet={handleDateChange}
        viewDidMount={handleViewChange}
        height="100%"
        locale="fr"
        buttonText={{
          today: "Aujourd'hui",
          month: "Mois",
          week: "Semaine",
          day: "Jour"
        }}
        dayHeaderFormat={{ weekday: 'long' }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        weekends={true}
        nowIndicator={true}
        dayMaxEvents={3}
        moreLinkClick="popover"
      />
    </div>
  );
}