import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Home, Users, Heart, BookOpen, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ONBOARDING_SLIDES } from "./onboarding-data";

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const NAV_ITEMS = [
  { path: "/", icon: Home, defaultLabel: "홈" },
  { path: "/groups", icon: Users, defaultLabel: "소그룹" },
  { path: "/prayers", icon: Heart, defaultLabel: "기도" },
  { path: "/sermon-notes", icon: BookOpen, defaultLabel: "설교노트" },
  { path: "/my", icon: User, defaultLabel: "MY" },
] as const;

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setHighlightRect(null);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && !animating) goNext();
      if (e.key === "ArrowLeft" && !animating && currentIndex > 0) goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  useLayoutEffect(() => {
    if (animating || !isOpen || !containerRef.current) return;

    const slide = ONBOARDING_SLIDES[currentIndex];
    if (!slide.hasHighlight) {
      setHighlightRect(null);
      return;
    }

    const rafId = requestAnimationFrame(() => {
      const el = containerRef.current?.querySelector("[data-highlight]");
      if (!el) { setHighlightRect(null); return; }
      const containerRect = containerRef.current!.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setHighlightRect({
        top: elRect.top - containerRect.top,
        left: elRect.left - containerRect.left,
        width: elRect.width,
        height: elRect.height,
      });
    });

    return () => cancelAnimationFrame(rafId);
  }, [currentIndex, animating, isOpen]);

  if (!isOpen) return null;

  const slide = ONBOARDING_SLIDES[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === ONBOARDING_SLIDES.length - 1;
  const { MockComponent, hasHighlight, tooltipText, tooltipPosition, activeTab, activeTabLabel, floatingBadge } = slide;

  const transition = (fn: () => void) => {
    if (animating) return;
    setAnimating(true);
    setHighlightRect(null);
    setTimeout(() => { fn(); setAnimating(false); }, 150);
  };

  const goNext = () => {
    if (isLast) { onClose(); return; }
    transition(() => setCurrentIndex((i) => i + 1));
  };

  const goPrev = () => {
    if (isFirst) return;
    transition(() => setCurrentIndex((i) => i - 1));
  };

  const getTooltipStyle = (): React.CSSProperties => {
    if (!highlightRect) return { display: "none" };
    if (tooltipPosition === "bottom") {
      return { top: highlightRect.top + highlightRect.height + 14 };
    }
    return { bottom: `calc(100% - ${highlightRect.top}px + 14px)` };
  };

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col bg-background transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* 모의 화면 */}
      <div
        ref={containerRef}
        className={cn(
          "relative flex-1 overflow-hidden transition-opacity duration-150",
          animating ? "opacity-0" : "opacity-100"
        )}
      >
        <MockComponent />

        {/* 컷아웃 오버레이 */}
        {hasHighlight && highlightRect && (
          <>
            <div
              className="pointer-events-none absolute"
              style={{
                top: highlightRect.top,
                left: highlightRect.left,
                width: highlightRect.width,
                height: highlightRect.height,
                borderRadius: "12px",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.65)",
                zIndex: 110,
              }}
            />
            <div
              className="pointer-events-none absolute"
              style={{
                top: highlightRect.top,
                left: highlightRect.left,
                width: highlightRect.width,
                height: highlightRect.height,
                borderRadius: "12px",
                border: "2px solid rgba(255,255,255,0.25)",
                zIndex: 111,
              }}
            />
            {/* 툴팁 - 부드러운 폰트, 검은색 */}
            {tooltipText && (
              <div
                className="absolute left-4 right-4 z-[115] rounded-2xl bg-white px-4 py-3.5 shadow-xl dark:bg-gray-900"
                style={getTooltipStyle()}
              >
                {tooltipPosition === "bottom" ? (
                  <div className="absolute -top-2 left-8 h-0 w-0 border-x-8 border-b-8 border-x-transparent border-b-white dark:border-b-gray-900" />
                ) : (
                  <div className="absolute -bottom-2 left-8 h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-white dark:border-t-gray-900" />
                )}
                <p
                  className="text-sm leading-relaxed dark:text-white"
                  style={{ fontFamily: "'Nanum Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif", fontWeight: 400, color: "#0f0f0f" }}
                >
                  {tooltipText}
                </p>
              </div>
            )}
          </>
        )}

        {/* 활성 탭 하이라이트 - 흰색 배경 박스 */}
        {activeTab && hasHighlight && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[120]">
            <div className="flex h-16 items-center justify-around px-2">
              {NAV_ITEMS.map(({ path, icon: Icon, defaultLabel }) => {
                const isActive = path === activeTab;
                const label = isActive && activeTabLabel ? activeTabLabel : defaultLabel;
                return (
                  <div
                    key={path}
                    className={cn(
                      "relative flex flex-1 flex-col items-center gap-0.5 py-1",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {/* 흰색 배경 박스 - 세로 더 크게 */}
                    <div className="absolute inset-x-1 -inset-y-1 rounded-xl bg-white/92 shadow-sm" />
                    <Icon
                      className="relative h-5 w-5 fill-gray-700/10 text-gray-800"
                      strokeWidth={2.5}
                    />
                    <span className="relative text-[11px] font-semibold text-gray-800">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 교적부 같은 부가 배지 */}
        {floatingBadge && hasHighlight && (
          <div
            className="pointer-events-none absolute z-[125]"
            style={{
              top: floatingBadge.top,
              right: floatingBadge.right,
              left: floatingBadge.left,
            }}
          >
            {floatingBadge.callout ? (
              <div className="relative rounded-lg border border-primary/30 bg-white px-3 py-1.5 shadow-md dark:bg-gray-900">
                <span className="text-sm font-semibold text-primary">{floatingBadge.label}</span>
                {/* 오른쪽 말풍선 꼬리 (outer border) */}
                <div className="absolute -right-[8px] top-1/2 -translate-y-1/2 h-0 w-0 border-t-[6px] border-b-[6px] border-l-[8px] border-t-transparent border-b-transparent border-l-primary/30" />
                {/* 오른쪽 말풍선 꼬리 (inner fill) */}
                <div className="absolute -right-[6px] top-1/2 -translate-y-1/2 h-0 w-0 border-t-[5px] border-b-[5px] border-l-[6px] border-t-transparent border-b-transparent border-l-white dark:border-l-gray-900" />
              </div>
            ) : (
              <div className="flex items-center gap-1 rounded-full border border-primary/40 bg-white px-2.5 py-1 shadow-md dark:bg-gray-900">
                <span className="text-[11px] font-semibold text-primary">{floatingBadge.label}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단 컨트롤 바 */}
      <div className="border-t border-white/10 bg-black/75 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 py-3">
          {/* 왼쪽: 건너뛰기 */}
          <button
            onClick={onClose}
            className="min-w-[56px] text-left text-sm text-white/60 transition-colors hover:text-white/90"
          >
            건너뛰기
          </button>

          {/* 가운데: Dot 인디케이터 */}
          <div className="flex items-center gap-1.5">
            {ONBOARDING_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (animating || i === currentIndex) return;
                  transition(() => setCurrentIndex(i));
                }}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === currentIndex ? "h-2 w-5 bg-white" : "h-2 w-2 bg-white/30"
                )}
              />
            ))}
          </div>

          {/* 오른쪽: 이전/다음 화살표 */}
          <div className="flex min-w-[56px] items-center justify-end gap-1">
            <button
              onClick={goPrev}
              disabled={isFirst}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                isFirst
                  ? "text-white/20"
                  : "text-white hover:bg-white/10"
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              {isLast
                ? <span className="text-[11px] font-bold text-primary">시작</span>
                : <ChevronRight className="h-5 w-5" />
              }
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default OnboardingModal;
