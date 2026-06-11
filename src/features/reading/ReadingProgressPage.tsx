import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, BookMarked, Flame, ArrowLeft } from "lucide-react";
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
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const weeks = buildCalendarWeeks(calYear, calMonth);
  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

  const percent = progress?.progressPercent ?? 0;

  return (
    <div className="space-y-5 px-4 py-6">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate("/reading")} className="p-1 -ml-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <BookMarked className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold">내 진도</h1>
      </div>

      {/* 진도율 + streak */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border px-4 py-4">
          <p className="text-xs text-muted-foreground">전체 진도율</p>
          <p className="mt-1 text-3xl font-bold text-primary">{percent}%</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {progress?.completedCount ?? 0} / {progress?.totalDays ?? 0}일
          </p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border px-4 py-4">
          <p className="text-xs text-muted-foreground">연속 완독</p>
          <div className="mt-1 flex items-end gap-1">
            <span className="text-3xl font-bold text-orange-500">{progress?.streak ?? 0}</span>
            <span className="mb-1 text-base text-muted-foreground">일</span>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-xs text-muted-foreground">
              {(progress?.streak ?? 0) > 0 ? "스트릭 진행 중" : "오늘 완독을 시작해보세요"}
            </span>
          </div>
        </div>
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
        <div className="grid grid-cols-7 text-center">
          {DAYS.map((d) => (
            <div key={d} className="py-1 text-[11px] text-muted-foreground font-medium">{d}</div>
          ))}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              if (!day) return <div key={`${wi}-${di}`} />;
              const dateStr = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isCompleted = completedSet.has(dateStr);
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={dateStr}
                  className={`mx-auto my-0.5 flex h-8 w-8 items-center justify-center rounded-full text-[13px] transition-colors
                    ${isCompleted ? "bg-primary text-primary-foreground font-semibold" : ""}
                    ${isToday && !isCompleted ? "ring-2 ring-primary text-primary font-semibold" : ""}
                  `}
                >
                  {day}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
