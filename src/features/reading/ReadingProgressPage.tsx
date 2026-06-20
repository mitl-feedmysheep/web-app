import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, BookMarked, ArrowLeft } from "lucide-react";
import { readingApi } from "@/lib/api";
import type { MyReadingProgress } from "@/types";

function buildCalendarWeeks(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function ReadingProgressPage() {
  const [progress, setProgress] = useState<MyReadingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const navigate = useNavigate();

  const departmentId = localStorage.getItem("departmentId") ?? "";

  const load = useCallback(async () => {
    if (!departmentId) { setLoading(false); return; }
    try {
      const data = await readingApi.getMyProgress(departmentId);
      setProgress(data);
    } catch {
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const completedSet = new Set(
    (progress?.completedDates ?? []).map((d) => d.slice(0, 10))
  );
  const scheduledSet = new Set(
    (progress?.scheduledDates ?? []).map((d) => d.slice(0, 10))
  );

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const completedCount = progress?.completedCount ?? 0;
  const missedCount = (progress?.scheduledDates ?? []).length - completedCount;
  const percent = progress?.progressPercent ?? 0;

  const weeks = buildCalendarWeeks(calYear, calMonth);
  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

  const handleDayClick = (dateStr: string) => {
    navigate(`/reading?date=${dateStr}`);
  };

  return (
    <div className="space-y-5 px-4 py-6">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate("/reading")} className="p-1 -ml-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <BookMarked className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold">내 진도</h1>
      </div>

      {/* 읽은 날 / 안 읽은 날 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
          <p className="text-xs text-muted-foreground">완독</p>
          <div className="mt-1 flex items-end gap-1">
            <span className="text-3xl font-bold text-primary">{completedCount}</span>
            <span className="mb-1 text-base text-muted-foreground">일</span>
          </div>
          <p className="mt-1 text-xs text-primary/70">잘 하고 있어요 👏</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-4 dark:border-orange-900/30 dark:bg-orange-950/20">
          <p className="text-xs text-muted-foreground">미완독</p>
          <div className="mt-1 flex items-end gap-1">
            <span className="text-3xl font-bold text-orange-500">{missedCount}</span>
            <span className="mb-1 text-base text-muted-foreground">일</span>
          </div>
          <p className="mt-1 text-xs text-orange-500/80">
            {missedCount > 0 ? "아직 늦지 않았어요!" : "완벽해요! 🎉"}
          </p>
        </div>
      </div>

      {/* 전체 진도율 바 */}
      <div className="rounded-xl border px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">전체 진도율</p>
          <p className="text-xs font-semibold text-primary">{percent}%</p>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-[11px] text-muted-foreground">
          {completedCount} / {progress?.totalDays ?? 0}일 완료
        </p>
      </div>

      {/* 완독 캘린더 */}
      <div className="rounded-xl border px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            className="p-1 text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (calMonth === 1) { setCalYear((y) => y - 1); setCalMonth(12); }
              else setCalMonth((m) => m - 1);
            }}
          >
            ‹
          </button>
          <p className="text-sm font-semibold">{calYear}년 {calMonth}월</p>
          <button
            type="button"
            className="p-1 text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (calMonth === 12) { setCalYear((y) => y + 1); setCalMonth(1); }
              else setCalMonth((m) => m + 1);
            }}
          >
            ›
          </button>
        </div>

        {/* 범례 */}
        <div className="mb-3 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-primary" /> 완독
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-orange-200 dark:bg-orange-900/50" /> 미완독
          </span>
        </div>

        <div className="grid grid-cols-7 text-center">
          {DAYS.map((d) => (
            <div key={d} className="py-1 text-[11px] text-muted-foreground font-medium">{d}</div>
          ))}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              if (!day) return <div key={`${wi}-${di}`} />;
              const dateStr = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isCompleted = completedSet.has(dateStr);
              const isScheduled = scheduledSet.has(dateStr);
              const isMissed = isScheduled && !isCompleted;
              const isToday = dateStr === todayStr;
              const isClickable = isScheduled;

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && handleDayClick(dateStr)}
                  className={`mx-auto my-0.5 flex h-8 w-8 items-center justify-center rounded-full text-[13px] transition-colors
                    ${isCompleted ? "bg-primary text-primary-foreground font-semibold" : ""}
                    ${isMissed && !isToday ? "bg-orange-100 text-orange-500 dark:bg-orange-950/40 dark:text-orange-400" : ""}
                    ${isToday && !isCompleted ? "ring-2 ring-primary text-primary font-semibold" : ""}
                    ${isClickable ? "cursor-pointer hover:opacity-80 active:scale-95" : "cursor-default"}
                  `}
                >
                  {day}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
