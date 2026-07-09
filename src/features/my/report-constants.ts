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
