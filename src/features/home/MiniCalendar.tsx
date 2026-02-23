import { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react";
import { eventsApi, type EventItem } from "@/lib/api";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description?: string;
  time?: string;
  location?: string;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function normalizeTime(raw: unknown): string | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    const [h = 0, m = 0] = raw;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  if (typeof raw === "string") return raw;
  return undefined;
}

function formatTime(raw: unknown): string | undefined {
  const t = normalizeTime(raw);
  if (!t) return undefined;
  const parts = t.split(":");
  const hour = parseInt(parts[0], 10);
  const minute = parts[1] || "00";
  if (isNaN(hour)) return t;
  if (hour === 0) return `오전 12:${minute}`;
  if (hour < 12) return `오전 ${hour}:${minute}`;
  if (hour === 12) return `오후 12:${minute}`;
  return `오후 ${hour - 12}:${minute}`;
}

function toCalendarEvent(ev: EventItem): CalendarEvent {
  let time: string | undefined;
  try {
    if (ev.startTime && ev.endTime) {
      time = `${formatTime(ev.startTime)} - ${formatTime(ev.endTime)}`;
    } else if (ev.startTime) {
      time = formatTime(ev.startTime);
    }
  } catch {
    // time formatting failed — show event without time
  }

  return {
    id: ev.id,
    title: ev.title,
    date: ev.date,
    description: ev.description,
    time,
    location: ev.location,
  };
}

function MiniCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const fetchEvents = useCallback(async (y: number, m: number) => {
    const churchId = localStorage.getItem("churchId");
    if (!churchId) return;

    try {
      const data = await eventsApi.getByMonth(churchId, "CHURCH", y, m + 1);
      setEvents(data.map(toCalendarEvent));
    } catch {
      setEvents([]);
    }
  }, []);

  useEffect(() => {
    fetchEvents(year, month);
  }, [year, month, fetchEvents]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    return days;
  }, [year, month]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const key = ev.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  const monthEvents = useMemo(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

    return events
      .filter((ev) => ev.date.startsWith(monthStr))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events, year, month]);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const dateKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">교회 캘린더</h3>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-3">
        {/* Month navigation */}
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold">
            {year}년 {month + 1}월
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="mb-1 grid grid-cols-7 text-center">
          {WEEKDAYS.map((d, i) => (
            <span
              key={d}
              className={`text-[10px] font-medium ${
                i === 0
                  ? "text-red-400"
                  : i === 6
                    ? "text-blue-400"
                    : "text-muted-foreground"
              }`}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-8" />;
            }

            const dayEvents = eventsByDate.get(dateKey(day));
            const dayOfWeek = new Date(year, month, day).getDay();

            return (
              <button
                key={day}
                type="button"
                className="group relative flex h-8 flex-col items-center justify-center rounded-md transition-colors hover:bg-accent/60"
                onClick={() => {
                  if (dayEvents?.length) setSelectedEvent(dayEvents[0]);
                }}
              >
                <span
                  className={`text-xs leading-none ${
                    isToday(day)
                      ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold"
                      : dayOfWeek === 0
                        ? "text-red-400"
                        : dayOfWeek === 6
                          ? "text-blue-400"
                          : "text-foreground"
                  }`}
                >
                  {day}
                </span>
                {dayEvents && dayEvents.length > 0 && (
                  <div className="absolute bottom-0.5 flex gap-0.5">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <span
                        key={ev.id}
                        className="h-1 w-1 rounded-full bg-primary"
                      />
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="h-1 w-1 rounded-full bg-gray-400" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Monthly events list */}
        {monthEvents.length > 0 && (
          <div className="mt-2.5 space-y-1.5 border-t border-border/50 pt-2.5">
            <span className="text-[10px] font-medium text-muted-foreground">
              {month + 1}월 일정
            </span>
            {monthEvents.map((ev) => {
              const evDate = new Date(ev.date + "T00:00:00");
              const dayLabel = `${evDate.getMonth() + 1}/${evDate.getDate()}`;
              const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const isPast = evDate < todayStart;
              return (
                <button
                  key={ev.id}
                  type="button"
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent/50 ${isPast ? "opacity-45" : ""}`}
                  onClick={() => setSelectedEvent(ev)}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${isPast ? "bg-muted-foreground" : "bg-primary"}`} />
                  <span className={`min-w-0 flex-1 truncate text-xs font-medium ${isPast ? "text-muted-foreground" : ""}`}>
                    {ev.title}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {dayLabel}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Event detail overlay */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="w-full max-w-sm animate-in fade-in zoom-in-95 rounded-2xl bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-primary" />
                <h4 className="text-base font-bold">{selectedEvent.title}</h4>
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent"
                onClick={() => setSelectedEvent(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              {selectedEvent.description && (
                <p className="whitespace-pre-line text-foreground/80">
                  {selectedEvent.description}
                </p>
              )}
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  📅{" "}
                  {(() => {
                    const d = new Date(selectedEvent.date + "T00:00:00");
                    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
                  })()}
                </p>
                {selectedEvent.time && <p>🕐 {selectedEvent.time}</p>}
                {selectedEvent.location && (
                  <p>📍 {selectedEvent.location}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default MiniCalendar;
