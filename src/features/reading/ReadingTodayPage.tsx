import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, BookMarked, Youtube, ChevronLeft, ChevronRight, CheckCircle2, Circle, Headphones, Video, ImageIcon, X, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { readingApi } from "@/lib/api";
import type { TodayReading } from "@/types";

function MediaImage({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      <div className="relative flex items-center justify-center rounded-xl overflow-hidden bg-muted/40 min-h-[100px]">
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
          </div>
        )}
        {error ? (
          <div className="flex flex-col items-center gap-1.5 py-8 text-muted-foreground/40">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">이미지를 불러올 수 없어요</span>
          </div>
        ) : (
          <button type="button" onClick={() => loaded && setLightbox(true)} className="relative w-full">
            <img
              src={url}
              alt="오늘의 요약"
              crossOrigin="anonymous"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              className={`w-full max-h-[320px] rounded-xl object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
            />
            {loaded && (
              <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                <ZoomIn className="h-3 w-3" />
                크게 보기
              </span>
            )}
          </button>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-black/50 p-1.5 text-white"
            onClick={() => setLightbox(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={url}
            alt="오늘의 요약"
            crossOrigin="anonymous"
            className="max-h-[85dvh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

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
      <div className="px-4 py-4">
        <div className="mb-4 flex items-center gap-2">
          <button type="button" onClick={() => navigate("/")} className="p-1 -ml-1 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <BookMarked className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">리딩지저스</h1>
        </div>
        <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-2 text-center">
          <BookMarked className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">이 부서에서는 리딩지저스가 운영되지 않습니다.</p>
        </div>
      </div>
    );
  }

  if (!reading) {
    return (
      <div className="px-4 py-4">
        <div className="mb-4 flex items-center gap-2">
          <button type="button" onClick={() => navigate("/")} className="p-1 -ml-1 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <BookMarked className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">리딩지저스</h1>
        </div>
        <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-2 text-center">
          <BookMarked className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">오늘의 읽기 분량이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => navigate("/")} className="p-1 -ml-1 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">{reading.planTitle ?? "리딩플랜"}</h1>
        </div>
        <button
          type="button"
          className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate("/reading/progress")}
        >
          내 진도 <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 요약 텍스트 */}
      {reading.description && (
        <div className="rounded-xl border px-3 py-2.5">
          <p className="text-[11px] text-muted-foreground mb-1">요약</p>
          <p className="text-xs leading-relaxed whitespace-pre-line">{reading.description}</p>
        </div>
      )}

      {/* 읽기 범위 */}
      <div className="rounded-xl bg-primary/5 px-4 py-3">
        <p className="text-xs text-muted-foreground mb-0.5">오늘 읽을 범위</p>
        <p className="text-base font-semibold text-primary">{reading.readingRange}</p>
      </div>

      {/* 요약 사진 */}
      {reading.medias.length > 0 && (
        <div className="space-y-2">
          {reading.medias.map((m, i) => (
            <MediaImage key={i} url={m.url} />
          ))}
        </div>
      )}

      {/* 유튜브 링크 */}
      {reading.youtubeUrl && (
        <a
          href={reading.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 hover:bg-red-100 transition-colors dark:border-red-900/30 dark:bg-red-950/20"
        >
          <Youtube className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm font-medium">유튜브로 듣기</p>
        </a>
      )}

      {/* 오디오 링크 */}
      {reading.audioUrl && (
        <a
          href={reading.audioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5 hover:bg-sky-100 transition-colors dark:border-sky-900/30 dark:bg-sky-950/20"
        >
          <Headphones className="h-4 w-4 text-sky-500 shrink-0" />
          <p className="text-sm font-medium">오디오로 듣기</p>
        </a>
      )}

      {/* 비디오 링크 */}
      {reading.videoUrl && (
        <a
          href={reading.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2.5 hover:bg-violet-100 transition-colors dark:border-violet-900/30 dark:bg-violet-950/20"
        >
          <Video className="h-4 w-4 text-violet-500 shrink-0" />
          <p className="text-sm font-medium">영상으로 보기</p>
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
