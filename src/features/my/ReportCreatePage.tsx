import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { mediaApi, reportsApi, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ReportType } from "@/types";
import { REPORT_TYPE_LABELS, REPORT_TYPE_OPTIONS } from "./report-constants";

function ReportCreatePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<ReportType>("BUG");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<{ file: File; previewUrl: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = content.trim().length > 0 && !submitting;

  useEffect(() => {
    return () => {
      attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    const added = Array.from(selected).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setAttachments((prev) => [...prev, ...added]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setAttachments((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { id: reportId } = await reportsApi.create({
        type,
        content: content.trim(),
      });

      for (const { file } of attachments) {
        const { uploads } = await mediaApi.getPresignedUrls(
          "REPORT",
          reportId,
          file.name,
          file.type,
          file.size
        );
        const mediumUpload = uploads.find((u) => u.mediaType === "MEDIUM");
        if (!mediumUpload) continue;

        await mediaApi.uploadFile(mediumUpload.uploadUrl, file);
        await mediaApi.completeUpload("REPORT", reportId, [
          { mediaType: mediumUpload.mediaType, publicUrl: mediumUpload.publicUrl },
        ]);
      }

      toast.success("리포트가 접수되었어요. 확인 후 답변 드릴게요.");
      navigate(`/my/report/${reportId}`, { replace: true });
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "리포트 제출에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-2 border-b px-4 py-4">
        <button onClick={() => navigate(-1)} className="-ml-1 p-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">새 리포트 작성</h1>
      </header>

      <div className="flex-1 space-y-6 px-4 py-6">
        <div>
          <p className="mb-2 text-sm font-bold">어떤 내용인가요?</p>
          <div className="grid grid-cols-3 gap-2">
            {REPORT_TYPE_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setType(option)}
                className={cn(
                  "rounded-xl border-[1.5px] px-2 py-3 text-center text-xs font-bold transition-colors",
                  type === option
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground"
                )}
              >
                {REPORT_TYPE_LABELS[option]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold">내용</p>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="언제, 어떤 상황에서 발생했는지 구체적으로 적어주시면 빠르게 확인할 수 있어요."
            className="min-h-32 resize-none"
            maxLength={2000}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-bold">스크린샷 (선택)</p>
          <div className="flex flex-wrap gap-2">
            {attachments.map(({ file, previewUrl }, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative h-[4.4rem] w-[4.4rem] overflow-hidden rounded-lg border bg-secondary"
              >
                <img
                  src={previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                  aria-label="스크린샷 삭제"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-[4.4rem] w-[4.4rem] shrink-0 items-center justify-center rounded-lg border-[1.5px] border-dashed border-border text-muted-foreground"
              aria-label="스크린샷 추가"
            >
              <Plus className="h-5 w-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />
          </div>
        </div>

        <Button className="w-full" size="lg" disabled={!canSubmit} onClick={handleSubmit}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "보내기"}
        </Button>
      </div>
    </div>
  );
}

export default ReportCreatePage;
