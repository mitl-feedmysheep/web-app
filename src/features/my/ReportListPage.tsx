import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, MessageSquareWarning, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { membersApi, reportsApi, ApiError } from "@/lib/api";
import { toast } from "sonner";
import type { ReportStatus, ReportSummary } from "@/types";
import {
  REPORT_STATUS_BADGE_CLASS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_OPTIONS,
  REPORT_TYPE_BADGE_CLASS,
  REPORT_TYPE_LABELS,
  parseServerDate,
} from "./report-constants";

function ReportListPage() {
  const navigate = useNavigate();
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    membersApi
      .getMyInfo()
      .then((me) => setIsSystemAdmin(!!me.isSystemAdmin))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    reportsApi
      .getList()
      .then((data) => {
        if (!cancelled) setReports(data);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(
            err instanceof ApiError ? err.message : "리포트를 불러오지 못했습니다."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const statusCounts = useMemo(() => {
    const counts: Record<ReportStatus, number> = {
      RECEIVED: 0,
      CONFIRMED: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
    };
    for (const report of reports) counts[report.status] += 1;
    return counts;
  }, [reports]);

  const visibleReports = useMemo(
    () => (statusFilter === null ? reports : reports.filter((r) => r.status === statusFilter)),
    [reports, statusFilter]
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-2 border-b px-4 py-4">
        <button onClick={() => navigate("/my")} className="-ml-1 p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">버그 신고 · 기능 요청</h1>
      </header>

      <div className="flex-1 space-y-4 px-4 py-5">
        {isSystemAdmin && (
          <>
            <p className="text-xs text-muted-foreground">
              전체 유저의 리포트가 보여요 (관리자 전용)
            </p>
            <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4">
              <button
                onClick={() => setStatusFilter(null)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                  statusFilter === null
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground"
                }`}
              >
                전체 ({reports.length})
              </button>
              {REPORT_STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                    statusFilter === status
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {REPORT_STATUS_LABELS[status]} ({statusCounts[status]})
                </button>
              ))}
            </div>
          </>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : visibleReports.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <MessageSquareWarning className="h-8 w-8" />
            <p className="text-sm">아직 남긴 리포트가 없어요.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {visibleReports.map((report) => (
              <Card
                key={report.id}
                className="cursor-pointer border-0 shadow-md shadow-primary/5"
                onClick={() => navigate(`/my/report/${report.id}`)}
              >
                <CardContent className="space-y-1.5 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={REPORT_TYPE_BADGE_CLASS[report.type]}>
                      {REPORT_TYPE_LABELS[report.type]}
                    </Badge>
                    <Badge className={REPORT_STATUS_BADGE_CLASS[report.status]}>
                      {REPORT_STATUS_LABELS[report.status]}
                    </Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-foreground">
                    {report.content}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {isSystemAdmin && (
                      <>
                        <span className="font-semibold text-foreground">
                          {report.reporterName}
                          {report.reporterAffiliation && `(${report.reporterAffiliation})`}
                        </span>
                        <span>·</span>
                      </>
                    )}
                    <span>
                      {parseServerDate(report.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 mx-auto max-w-lg">
        <Button
          size="icon"
          className="pointer-events-auto absolute right-6 h-14 w-14 rounded-full shadow-lg shadow-primary/30"
          onClick={() => navigate("/my/report/new")}
          aria-label="새 리포트 작성"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

export default ReportListPage;
