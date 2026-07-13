import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const BULLET_PREFIX = "- ";

interface BulletTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
}

/**
 * 항상 하나의 "- " 불릿으로 시작하고, Enter를 치면 다음 줄에도 자동으로
 * "- "를 붙여주는 텍스트영역. 들여쓰기(하위 불릿)는 지원하지 않음 —
 * 빈 불릿에서 Enter를 치면 목록을 빠져나가는 일반 줄바꿈으로 처리됨.
 */
export function BulletTextarea({
  value,
  onChange,
  placeholder,
  rows = 2,
  maxLength,
  className,
}: BulletTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = () => {
    if (value === "") {
      onChange(BULLET_PREFIX);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        el?.setSelectionRange(BULLET_PREFIX.length, BULLET_PREFIX.length);
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;

    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd } = textarea;
    if (selectionStart !== selectionEnd) return;

    e.preventDefault();

    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const currentLine = value.slice(lineStart, selectionStart);
    const isEmptyBullet = currentLine.trim() === "-" || currentLine.trim() === "";

    let newValue: string;
    let cursorPos: number;

    if (isEmptyBullet) {
      const before = value.slice(0, lineStart);
      const after = value.slice(selectionStart);
      newValue = `${before}\n${after}`;
      cursorPos = lineStart + 1;
    } else {
      const before = value.slice(0, selectionStart);
      const after = value.slice(selectionStart);
      newValue = `${before}\n${BULLET_PREFIX}${after}`;
      cursorPos = selectionStart + 1 + BULLET_PREFIX.length;
    }

    onChange(newValue);
    requestAnimationFrame(() => {
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      className={cn(
        "w-full resize-none overflow-y-auto rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    />
  );
}
