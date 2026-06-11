import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, BookMarked, Youtube, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { readingApi } from "@/lib/api";
import type { TodayReading } from "@/types";

export default function ReadingTodayPage() {
  const [reading, setReading] = useState<TodayReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const navigate = useNavigate();

  const departmentId = localStorage.getItem("departmentId") ?? "";

  const load = useCallback(async () => {
    if (!departmentId) { setLoading(false); return; }
    try {
      const isEnabled = await readingApi.getStatus(departmentId);
      setEnabled(isEnabled);
      if (!isEnabled) { setLoading(false); return; }
      const data = await readingApi.getToday(departmentId);
      setReading(data);
    } catch {
      setReading(null);
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async () => {
    if (!reading || toggling) return;
    const newCompleted = !reading.completed;
    setToggling(true);
    setReading((prev) => prev ? { ...prev, completed: newCompleted } : prev);
    try {
      if (newCompleted) {
        await readingApi.markComplete(departmentId, reading.dayId);
        toast.success("완독 완료! 🎉");
      } else {
        await readingApi.unmarkComplete(departmentId, reading.dayId);
        toast.success("완독이 취소됐습니다.");
      }
    } catch {
      setReading((prev) => prev ? { ...prev, completed: !newCompleted } : prev);
      toast.error("처리 중 오류가 발생했습니다.");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-2 px-4 text-center">
        <BookMarked className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">이 부서에서는 리딩지저스가 운영되지 않습니다.</p>
      </div>
    );
  }

  if (!reading) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-2 px-4 text-center">
        <BookMarked className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">오늘의 읽기 분량이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">리딩지저스</h1>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {reading.readingDate} · Day {reading.dayNumber}
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate("/reading/progress")}
        >
          내 진도 <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 읽기 범위 */}
      <div className="rounded-xl bg-primary/5 px-4 py-4">
        <p className="text-xs text-muted-foreground mb-1">오늘 읽을 범위</p>
        <p className="text-base font-semibold text-primary">{reading.readingRange}</p>
      </div>

      {/* 요약 사진 */}
      {reading.medias.length > 0 && (
        <div className="space-y-2">
          {reading.medias
            .filter((m) => m.mediaType === "MEDIUM" || m.mediaType === "THUMBNAIL")
            .map((m, i) => (
              <img
                key={i}
                src={m.url}
                alt="오늘의 요약"
                crossOrigin="anonymous"
                className="w-full rounded-xl object-cover"
              />
            ))}
        </div>
      )}

      {/* 요약 텍스트 */}
      {reading.description && (
        <div className="rounded-xl border px-4 py-3">
          <p className="text-xs text-muted-foreground mb-1.5">요약</p>
          <p className="text-sm leading-relaxed whitespace-pre-line">{reading.description}</p>
        </div>
      )}

      {/* 유튜브 링크 */}
      {reading.youtubeUrl && (
        <a
          href={reading.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 hover:bg-red-100 transition-colors dark:border-red-900/30 dark:bg-red-950/20"
        >
          <Youtube className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium">유튜브로 듣기</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{reading.youtubeUrl}</p>
          </div>
        </a>
      )}

      {/* 완독 버튼 */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={toggling}
        className={`w-full flex items-center justify-center gap-2.5 rounded-xl py-4 text-base font-semibold transition-all ${
          reading.completed
            ? "bg-primary/10 text-primary border-2 border-primary/30"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {toggling ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : reading.completed ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            완독 완료 ✓
          </>
        ) : (
          <>
            <Circle className="h-5 w-5" />
            완독했어요
          </>
        )}
      </button>
    </div>
  );
}
