import { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react";
import { eventsApi, type EventItem } from "@/lib/api";

interface CalendarEvent {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  description?: string;
  time?: string;
  location?: string;
  color: string;
}

interface WeekEventSegment {
  event: CalendarEvent;
  startCol: number; // 0~6
  span: number;
  lane: number;
  isStart: boolean;
  isEnd: boolean;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MAX_VISIBLE_LANES = 2;

// Google Calendar 스타일 색상 (API color 값 → 스타일 매핑)
const EVENT_COLORS: Record<string, { dot: string; bar: string; barHover: string }> = {
  PEACOCK: { dot: "bg-[#039BE5]", bar: "bg-[#039BE5]/80", barHover: "hover:bg-[#039BE5]" },
  TOMATO: { dot: "bg-[#D50000]", bar: "bg-[#D50000]/80", barHover: "hover:bg-[#D50000]" },
  SAGE: { dot: "bg-[#33B679]", bar: "bg-[#33B679]/80", barHover: "hover:bg-[#33B679]" },
  TANGERINE: { dot: "bg-[#F4511E]", bar: "bg-[#F4511E]/80", barHover: "hover:bg-[#F4511E]" },
  LAVENDER: { dot: "bg-[#7986CB]", bar: "bg-[#7986CB]/80", barHover: "hover:bg-[#7986CB]" },
  FLAMINGO: { dot: "bg-[#E67C73]", bar: "bg-[#E67C73]/80", barHover: "hover:bg-[#E67C73]" },
  BANANA: { dot: "bg-[#F09300]", bar: "bg-[#F09300]/80", barHover: "hover:bg-[#F09300]" },
  GRAPHITE: { dot: "bg-[#616161]", bar: "bg-[#616161]/80", barHover: "hover:bg-[#616161]" },
};

const DEFAULT_COLOR = EVENT_COLORS.PEACOCK;

function getEventColor(colorName: string): { dot: string; bar: string; barHover: string } {
  return EVENT_COLORS[colorName] ?? DEFAULT_COLOR;
}

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
    startDate: ev.startDate,
    endDate: ev.endDate,
    description: ev.description,
    time,
    location: ev.location,
    color: ev.color,
  };
}

/** Parse "YYYY-MM-DD" as local date */
function parseDate(s: string): Date {
  return new Date(s + "T00:00:00");
}

/** Format date as "YYYY-MM-DD" */
function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Check if a date string falls within [start, end] inclusive */
function dateInRange(dateStr: string, startStr: string, endStr: string): boolean {
  return dateStr >= startStr && dateStr <= endStr;
}

/** Get events active on a specific date */
function getEventsForDate(events: CalendarEvent[], dateStr: string): CalendarEvent[] {
  return events.filter((ev) => dateInRange(dateStr, ev.startDate, ev.endDate));
}

/** Build week rows from year/month */
function buildWeekRows(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const flat: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) flat.push(null);
  for (let d = 1; d <= daysInMonth; d++) flat.push(d);
  // pad last week to 7
  while (flat.length % 7 !== 0) flat.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < flat.length; i += 7) {
    weeks.push(flat.slice(i, i + 7));
  }
  return weeks;
}

/** Compute bar segments for one week row */
function computeSegments(
  week: (number | null)[],
  events: CalendarEvent[],
  year: number,
  month: number,
): WeekEventSegment[] {
  // Build date strings for each col in the week
  const colDates: (string | null)[] = week.map((day) =>
    day !== null ? fmtDate(new Date(year, month, day)) : null,
  );

  // Find events that overlap this week
  const validDates = colDates.filter((d): d is string => d !== null);
  if (validDates.length === 0) return [];

  const weekStart = validDates[0];
  const weekEnd = validDates[validDates.length - 1];

  const overlapping = events.filter(
    (ev) => ev.startDate !== ev.endDate && ev.startDate <= weekEnd && ev.endDate >= weekStart,
  );

  // Sort: longer events first, then by start date
  overlapping.sort((a, b) => {
    const aDays = daysBetween(a.startDate, a.endDate);
    const bDays = daysBetween(b.startDate, b.endDate);
    if (bDays !== aDays) return bDays - aDays;
    return a.startDate.localeCompare(b.startDate);
  });

  // Build segments
  const segments: Omit<WeekEventSegment, "lane">[] = [];
  for (const ev of overlapping) {
    // Find first col where event is active
    let startCol = -1;
    let endCol = -1;
    for (let c = 0; c < 7; c++) {
      const d = colDates[c];
      if (d && dateInRange(d, ev.startDate, ev.endDate)) {
        if (startCol === -1) startCol = c;
        endCol = c;
      }
    }
    if (startCol === -1) continue;

    const span = endCol - startCol + 1;
    const isStart = colDates[startCol] === ev.startDate;
    const isEnd = colDates[endCol] === ev.endDate;

    segments.push({ event: ev, startCol, span, isStart, isEnd });
  }

  // Greedy lane allocation
  const result: WeekEventSegment[] = [];
  const lanes: number[][] = []; // lanes[lane] = list of endCols of segments in that lane

  for (const seg of segments) {
    let assignedLane = -1;
    for (let l = 0; l < lanes.length; l++) {
      const occupied = lanes[l].some(
        (end) => end >= seg.startCol,
      );
      if (!occupied) {
        assignedLane = l;
        break;
      }
    }
    if (assignedLane === -1) {
      assignedLane = lanes.length;
      lanes.push([]);
    }
    lanes[assignedLane].push(seg.startCol + seg.span - 1);
    result.push({ ...seg, lane: assignedLane });
  }

  return result;
}

function daysBetween(start: string, end: string): number {
  const s = parseDate(start);
  const e = parseDate(end);
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

function MiniCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [dayEventsList, setDayEventsList] = useState<{ date: string; events: CalendarEvent[] } | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [expanded, setExpanded] = useState(false);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const fetchEvents = useCallback(async (y: number, m: number) => {
    const departmentId = localStorage.getItem("departmentId");
    if (!departmentId) return;

    try {
      const data = await eventsApi.getByMonth(departmentId, "DEPARTMENT", y, m + 1);
      setEvents(data.map(toCalendarEvent));
    } catch {
      setEvents([]);
    }
  }, []);

  useEffect(() => {
    fetchEvents(year, month);
  }, [year, month, fetchEvents]);

  const weekRows = useMemo(() => buildWeekRows(year, month), [year, month]);

  const weekSegments = useMemo(
    () => weekRows.map((week) => computeSegments(week, events, year, month)),
    [weekRows, events, year, month],
  );

  const monthEvents = useMemo(() => {
    const monthStart = fmtDate(new Date(year, month, 1));
    const monthEnd = fmtDate(new Date(year, month + 1, 0));

    // Deduplicate by event id (an event spanning weeks would appear once)
    const seen = new Set<string>();
    return events
      .filter((ev) => {
        if (seen.has(ev.id)) return false;
        // Event overlaps this month
        if (ev.endDate < monthStart || ev.startDate > monthEnd) return false;
        seen.add(ev.id);
        return true;
      })
      .sort((a, b) => {
        const todayStr = fmtDate(today);
        const aIsPast = a.endDate < todayStr;
        const bIsPast = b.endDate < todayStr;
        if (aIsPast !== bIsPast) return aIsPast ? 1 : -1;
        if (aIsPast) return b.startDate.localeCompare(a.startDate);
        return a.startDate.localeCompare(b.startDate);
      });
  }, [events, year, month]);

  const prevMonth = () => { setViewDate(new Date(year, month - 1, 1)); setExpanded(false); };
  const nextMonth = () => { setViewDate(new Date(year, month + 1, 1)); setExpanded(false); };

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

        {/* Calendar grid — week by week */}
        {weekRows.map((week, weekIdx) => {
          const segments = weekSegments[weekIdx];
          const maxLane = segments.length > 0
            ? Math.min(Math.max(...segments.map((s) => s.lane)), MAX_VISIBLE_LANES - 1)
            : -1;
          const visibleSegments = segments.filter((s) => s.lane < MAX_VISIBLE_LANES);
          const hiddenCount = segments.filter((s) => s.lane >= MAX_VISIBLE_LANES).length;
          const barAreaHeight = maxLane >= 0 ? (maxLane + 1) * 6 + (hiddenCount > 0 ? 10 : 0) : 0;

          return (
            <div key={weekIdx}>
              {/* Date numbers */}
              <div className="grid grid-cols-7">
                {week.map((day, colIdx) => {
                  if (day === null) {
                    return <div key={`empty-${weekIdx}-${colIdx}`} className="h-7" />;
                  }

                  const dayOfWeek = new Date(year, month, day).getDay();
                  const dayEvts = getEventsForDate(events, dateKey(day));
                  const singleDayEvts = dayEvts.filter((ev) => ev.startDate === ev.endDate);

                  return (
                    <button
                      key={day}
                      type="button"
                      className="group relative flex h-8 flex-col items-center justify-center rounded-md transition-colors hover:bg-accent/60"
                      onClick={() => {
                        if (dayEvts.length === 1) setSelectedEvent(dayEvts[0]);
                        else if (dayEvts.length >= 2) setDayEventsList({ date: dateKey(day), events: dayEvts });
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
                      {singleDayEvts.length > 0 && (
                        <div className="absolute bottom-0.5 flex gap-0.5">
                          {singleDayEvts.slice(0, 2).map((ev) => (
                            <span
                              key={ev.id}
                              className={`h-1 w-1 rounded-full ${getEventColor(ev.color).dot}`}
                            />
                          ))}
                          {singleDayEvts.length > 2 && (
                            <span className="h-1 w-1 rounded-full bg-gray-400" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Event bars */}
              {barAreaHeight > 0 && (
                <div className="relative" style={{ height: barAreaHeight }}>
                  {visibleSegments.map((seg) => {
                    const left = (seg.startCol / 7) * 100;
                    const width = (seg.span / 7) * 100;
                    const top = seg.lane * 6;
                    const roundedL = seg.isStart ? "rounded-l-sm" : "";
                    const roundedR = seg.isEnd ? "rounded-r-sm" : "";

                    return (
                      <button
                        key={`${seg.event.id}-${weekIdx}`}
                        type="button"
                        className={`absolute h-[3px] ${getEventColor(seg.event.color).bar} ${getEventColor(seg.event.color).barHover} transition-colors ${roundedL} ${roundedR}`}
                        style={{ left: `${left}%`, width: `${width}%`, top }}
                        onClick={() => setSelectedEvent(seg.event)}
                      >
                      </button>
                    );
                  })}
                  {hiddenCount > 0 && (
                    <div
                      className="absolute text-[9px] text-muted-foreground left-0 px-1"
                      style={{ top: (maxLane + 1) * 6 }}
                    >
                      +{hiddenCount}개 더보기
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Monthly events list */}
        {monthEvents.length > 0 && (() => {
          const DEFAULT_VISIBLE = 3;
          const visibleEvents = expanded ? monthEvents : monthEvents.slice(0, DEFAULT_VISIBLE);
          const hiddenCount = monthEvents.length - DEFAULT_VISIBLE;

          return (
            <div className="mt-2.5 space-y-1.5 border-t border-border/50 pt-2.5">
              <span className="text-[10px] font-medium text-muted-foreground">
                {month + 1}월 일정
              </span>
              {visibleEvents.map((ev) => {
                const sDate = parseDate(ev.startDate);
                const eDate = parseDate(ev.endDate);
                const isMultiDay = ev.startDate !== ev.endDate;
                const dayLabel = isMultiDay
                  ? `${sDate.getMonth() + 1}/${sDate.getDate()} - ${eDate.getMonth() + 1}/${eDate.getDate()}`
                  : `${sDate.getMonth() + 1}/${sDate.getDate()}`;
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isPast = eDate < todayStart;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent/50 ${isPast ? "opacity-45" : ""}`}
                    onClick={() => setSelectedEvent(ev)}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${isPast ? "bg-muted-foreground" : getEventColor(ev.color).dot}`} />
                    <span className={`min-w-0 flex-1 truncate text-xs font-medium ${isPast ? "text-muted-foreground" : ""}`}>
                      {ev.title}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {dayLabel}
                    </span>
                  </button>
                );
              })}
              {hiddenCount > 0 && (
                <button
                  type="button"
                  className="w-full py-1 text-center text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setExpanded((prev) => !prev)}
                >
                  {expanded ? "▲ 접기" : `▼ ${hiddenCount}개 더보기`}
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* Day events list overlay */}
      {dayEventsList && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setDayEventsList(null)}
        >
          <div
            className="w-full max-w-sm animate-in fade-in zoom-in-95 rounded-2xl bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between">
              <h4 className="text-sm font-bold">
                {(() => {
                  const d = parseDate(dayEventsList.date);
                  return `${d.getMonth() + 1}월 ${d.getDate()}일(${WEEKDAYS[d.getDay()]}) 일정`;
                })()}
              </h4>
              <button
                type="button"
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent"
                onClick={() => setDayEventsList(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              {dayEventsList.events.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent/50"
                  onClick={() => {
                    setDayEventsList(null);
                    setSelectedEvent(ev);
                  }}
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${getEventColor(ev.color).dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{ev.title}</p>
                    {ev.time && (
                      <p className="text-[10px] text-muted-foreground">{ev.time}</p>
                    )}
                  </div>
                  <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
                <span className={`h-3 w-3 rounded-full ${getEventColor(selectedEvent.color).dot}`} />
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
                  {(() => {
                    const s = parseDate(selectedEvent.startDate);
                    const e = parseDate(selectedEvent.endDate);
                    const fmt = (d: Date) =>
                      `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일(${WEEKDAYS[d.getDay()]})`;
                    if (selectedEvent.startDate === selectedEvent.endDate) {
                      return `📅 ${fmt(s)}`;
                    }
                    return `📅 ${fmt(s)} ~ ${fmt(e)}`;
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
