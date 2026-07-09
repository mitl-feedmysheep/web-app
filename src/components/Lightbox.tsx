import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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
        if (Math.abs(delta) > 50) {
          if (delta < 0) next();
          else prev();
        }
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
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 && scale <= 1 && (
        <button
          type="button"
          onClick={prev}
          className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <img
        src={images[index]}
        alt=""
        className="max-h-[80vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl select-none"
        crossOrigin="anonymous"
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
          className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 z-10 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white">
          <span>{index + 1}</span>
          <span className="text-white/50"> / {images.length}</span>
        </div>
      )}
    </div>
  );
}

export default Lightbox;
