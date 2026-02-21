import { useEffect, useRef } from "react";

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: {
          roadAddress?: string;
          jibunAddress?: string;
          zonecode?: string;
        }) => void;
        width?: string;
        height?: string;
      }) => { embed: (el: HTMLElement) => void };
    };
  }
}

interface DaumPostcodeModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (data: { zonecode: string; address: string }) => void;
}

function loadDaumPostcodeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.daum?.Postcode) {
      resolve();
      return;
    }

    const src =
      "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    const existing = document.querySelector(
      `script[src="${src}"]`
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Daum Postcode script"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Daum Postcode script"));
    document.head.appendChild(script);
  });
}

function DaumPostcodeModal({ open, onClose, onSelect }: DaumPostcodeModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const containerEl = containerRef.current;

    const mount = async () => {
      await loadDaumPostcodeScript();
      if (!containerEl || !window.daum) return;

      const postcode = new window.daum.Postcode({
        oncomplete: (data) => {
          const address = data.roadAddress || data.jibunAddress || "";
          const zonecode = data.zonecode || "";
          onSelect({ zonecode, address });
          setTimeout(() => onClose(), 120);
        },
        width: "100%",
        height: "100%",
      });

      postcode.embed(containerEl);
    };

    mount();

    return () => {
      if (containerEl) containerEl.innerHTML = "";
    };
  }, [open, onClose, onSelect]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex h-[78dvh] w-[92%] max-w-sm flex-col overflow-hidden rounded-2xl bg-background shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-medium">우편번호 찾기</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div ref={containerRef} className="flex-1" />
      </div>
    </div>
  );
}

export default DaumPostcodeModal;
