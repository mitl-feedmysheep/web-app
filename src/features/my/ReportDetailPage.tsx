import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { membersApi, reportsApi, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ReportDetail, ReportStatus } from "@/types";
import {
  REPORT_STATUS_BADGE_CLASS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_OPTIONS,
  REPORT_TYPE_LABELS,
} from "./report-constants";

function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  const loadDetail = async () => {
    if (!reportId) return;
    try {
      const data = await reportsApi.getDetail(reportId);
      setDetail(data);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "리포트를 불러오지 못했습니다."
      );
      navigate("/my/report", { replace: true });
    }
  };

  useEffect(() => {
    membersApi
      .getMyInfo()
      .then((me) => {
        setMyMemberId(me.id);
        setIsSystemAdmin(!!me.isSystemAdmin);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    loadDetail().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const handleSendComment = async () => {
    if (!reportId || !comment.trim() || sending) return;
    setSending(true);
    try {
      await reportsApi.addComment(reportId, comment.trim());
      setComment("");
      await loadDetail();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "답변 등록에 실패했습니다."
      );
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: ReportStatus) => {
    if (!reportId || !detail) return;
    setStatusSaving(true);
    try {
      await reportsApi.updateStatus(reportId, status);
      setDetail({ ...detail, status });
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "상태 변경에 실패했습니다."
      );
    } finally {
      setStatusSaving(false);
    }
  };

  if (loading || !detail) {
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center gap-2 border-b px-4 py-4">
          <button onClick={() => navigate("/my/report")} className="-ml-1 p-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold">리포트</h1>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const isViewingOthersReport = isSystemAdmin && myMemberId !== detail.reporterId;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-2 border-b px-4 py-4">
        <button onClick={() => navigate("/my/report")} className="-ml-1 p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-base font-semibold">리포트</h1>
        {!isViewingOthersReport && (
          <Badge className={REPORT_STATUS_BADGE_CLASS[detail.status]}>
            {REPORT_STATUS_LABELS[detail.status]}
          </Badge>
        )}
      </header>

      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-5 pb-28">
        <div className="space-y-2 rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary">
              {REPORT_TYPE_LABELS[detail.type]}
            </span>
            {isSystemAdmin && (
              <span className="text-xs text-muted-foreground">
                · {detail.reporterName}
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {detail.content}
          </p>

          {isViewingOthersReport && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2 rounded-xl bg-accent px-3 py-2">
                <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                  상태
                </span>
                <Select
                  value={detail.status}
                  onValueChange={(v) => handleStatusChange(v as ReportStatus)}
                  disabled={statusSaving}
                >
                  <SelectTrigger size="sm" className="flex-1 bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {REPORT_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="px-1 text-xs text-muted-foreground">
                상태만 바꾸면 알림이 가지 않아요. 답변을 남겨야 유저에게 푸시가 가요.
              </p>
            </div>
          )}
        </div>

        <div className="pt-4">
          {detail.comments.map((c) => (
            <div
              key={c.id}
              className={cn("mb-3 flex", c.isMine ? "justify-end" : "justify-start")}
            >
              <div className={cn("flex max-w-[78%] flex-col", c.isMine && "items-end")}>
                {!c.isMine && (
                  <span className="mb-1 px-1 text-xs font-bold text-muted-foreground">
                    {c.authorName}
                  </span>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    c.isMine
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md border bg-card"
                  )}
                >
                  {c.content}
                </div>
                <span className="mt-1 px-1 text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleString("ko-KR", {
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-lg items-center gap-2 border-t bg-background px-4 py-3">
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendComment();
            }
          }}
          placeholder={isViewingOthersReport ? "답변을 입력하면 유저에게 푸시가 가요" : "답변을 입력하세요"}
          className="flex-1 rounded-full border bg-secondary px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={handleSendComment}
          disabled={!comment.trim() || sending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          aria-label="답변 보내기"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default ReportDetailPage;
