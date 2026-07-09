import type { ReportStatus, ReportType } from "@/types";

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  BUG: "버그",
  FEATURE_REQUEST: "기능 요청",
  QUESTION: "질문",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  RECEIVED: "접수됨",
  CONFIRMED: "확인",
  IN_PROGRESS: "작업중",
  RESOLVED: "완료",
};

export const REPORT_STATUS_BADGE_CLASS: Record<ReportStatus, string> = {
  RECEIVED: "bg-secondary text-muted-foreground",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-primary/15 text-primary",
};

export const REPORT_TYPE_BADGE_CLASS: Record<ReportType, string> = {
  BUG: "bg-red-100 text-red-700",
  FEATURE_REQUEST: "bg-blue-100 text-blue-700",
  QUESTION: "bg-emerald-100 text-emerald-700",
};

export const REPORT_TYPE_EMOJI: Record<ReportType, string> = {
  BUG: "🐛",
  FEATURE_REQUEST: "🆕",
  QUESTION: "🙋‍♂️",
};

export const REPORT_STATUS_OPTIONS: ReportStatus[] = [
  "RECEIVED",
  "CONFIRMED",
  "IN_PROGRESS",
  "RESOLVED",
];

export const REPORT_TYPE_OPTIONS: ReportType[] = [
  "BUG",
  "FEATURE_REQUEST",
  "QUESTION",
];

/**
 * 백엔드가 LocalDateTime(UTC 저장)을 타임존 표기 없이 직렬화하므로,
 * 브라우저가 이를 로컬 시간으로 오인하지 않도록 UTC로 명시해서 파싱한다.
 */
export function parseServerDate(value: string): Date {
  const hasTimezone = /[Zz]|[+-]\d{2}:?\d{2}$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}
