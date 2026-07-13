import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useNavigationType } from "react-router-dom";
import { ArrowLeft, Loader2, Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";
import { announcementsApi } from "@/lib/api";
import type { AnnouncementItem } from "@/lib/api";

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function Lightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);

  const pinchStartRef = useRef<{ dist: number; scale: number } | null>(null);
  const panStartRef = useRef<{ touchX: number; touchY: number; transX: number; transY: number } | null>(null);
  const swipeStartRef = useRef<number | null>(null);

  const resetTransform = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const goTo = (newIndex: number) => {
    resetTransform();
    setIndex(newIndex);
  };
  const prev = () => goTo((index - 1 + images.length) % images.length);
  const next = () => goTo((index + 1) % images.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const pinchDist = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchStartRef.current = { dist: pinchDist(e.touches), scale };
      setIsPinching(true);
      swipeStartRef.current = null;
      panStartRef.current = null;
    } else if (e.touches.length === 1) {
      if (scale > 1) {
        panStartRef.current = {
          touchX: e.touches[0].clientX,
          touchY: e.touches[0].clientY,
          transX: translate.x,
          transY: translate.y,
        };
        swipeStartRef.current = null;
      } else {
        swipeStartRef.current = e.touches[0].clientX;
        panStartRef.current = null;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartRef.current) {
      const newDist = pinchDist(e.touches);
      const newScale = Math.max(1, Math.min(5, pinchStartRef.current.scale * (newDist / pinchStartRef.current.dist)));
      setScale(newScale);
      if (newScale <= 1) setTranslate({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && panStartRef.current && scale > 1) {
      const dx = e.touches[0].clientX - panStartRef.current.touchX;
      const dy = e.touches[0].clientY - panStartRef.current.touchY;
      setTranslate({ x: panStartRef.current.transX + dx, y: panStartRef.current.transY + dy });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2 && pinchStartRef.current) {
      pinchStartRef.current = null;
      setIsPinching(false);
      if (scale < 1.05) resetTransform();
    }
    if (e.touches.length === 0) {
      panStartRef.current = null;
      if (swipeStartRef.current !== null && scale <= 1) {
        const delta = e.changedTouches[0].clientX - swipeStartRef.current;
        if (Math.abs(delta) > 50) delta < 0 ? next() : prev();
        swipeStartRef.current = null;
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/90"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 && scale <= 1 && (
        <button
          type="button"
          onClick={prev}
          className="absolute left-3 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <img
        src={images[index]}
        alt=""
        className="max-h-[85dvh] max-w-[90vw] rounded-md object-contain select-none"
        draggable={false}
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: "center",
          willChange: "transform",
          transition: isPinching ? "none" : "transform 0.15s ease",
          cursor: scale > 1 ? "grab" : "default",
          touchAction: "none",
        }}
      />

      {images.length > 1 && scale <= 1 && (
        <button
          type="button"
          onClick={next}
          className="absolute right-3 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-5 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-white" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [announcement, setAnnouncement] = useState<AnnouncementItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await announcementsApi.getById(id);
        setAnnouncement(data);
      } catch {
        navigate("/announcements");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!announcement) return null;

  const images = announcement.images ?? [];

  return (
    <div className="min-h-dvh pb-8">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/40 bg-background/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => (navigationType === "PUSH" ? navigate(-1) : navigate("/", { replace: true }))}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold leading-tight">{announcement.title}</h1>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(announcement.sendAt)}
        </div>

        <div className="mt-6 h-px bg-border/50" />

        {announcement.body && (
          <p className="mt-6 whitespace-pre-wrap text-[15px] leading-[1.8] text-foreground/85">
            {announcement.body}
          </p>
        )}

        {images.length > 0 && (
          <div className="mt-6">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {images.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border/50"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}

export default AnnouncementDetailPage;
