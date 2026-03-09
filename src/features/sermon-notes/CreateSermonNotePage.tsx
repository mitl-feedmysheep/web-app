import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sermonNotesApi, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function CreateSermonNotePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [title, setTitle] = useState("");
  const [sermonDate, setSermonDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [preacher, setPreacher] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [scripture, setScripture] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [serviceTypeSuggestions, setServiceTypeSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const serviceTypeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sermonNotesApi.getServiceTypes().then(setServiceTypeSuggestions).catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const note = await sermonNotesApi.getById(id);
        setTitle(note.title);
        setSermonDate(note.sermonDate);
        setPreacher(note.preacher ?? "");
        setServiceType(note.serviceType ?? "");
        setScripture(note.scripture ?? "");
        setContent(note.content);
      } catch (err) {
        toast.error(
          err instanceof ApiError ? err.message : "노트를 불러오지 못했습니다."
        );
        navigate("/sermon-notes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (serviceTypeRef.current && !serviceTypeRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = serviceTypeSuggestions.filter(
    (s) => s.toLowerCase().includes(serviceType.toLowerCase()) && s !== serviceType
  );

  const canSubmit = title.trim() && sermonDate && content.trim() && !saving;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);

    const payload = {
      title: title.trim(),
      sermonDate,
      preacher: preacher.trim() || undefined,
      serviceType: serviceType.trim() || undefined,
      scripture: scripture.trim() || undefined,
      content: content.trim(),
    };

    try {
      if (isEdit && id) {
        await sermonNotesApi.update(id, payload);
        toast.success("설교 노트가 수정되었습니다.");
        navigate(`/sermon-notes/${id}`);
      } else {
        const created = await sermonNotesApi.create(payload);
        toast.success("설교 노트가 작성되었습니다.");
        navigate(`/sermon-notes/${created.id}`);
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "저장에 실패했습니다."
      );
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/40 bg-background/95 px-4 py-3 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          취소
        </button>
        <h2 className="text-sm font-semibold">
          {isEdit ? "노트 수정" : "새 설교 노트"}
        </h2>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "text-sm font-semibold transition-colors",
            canSubmit
              ? "text-primary hover:text-primary/80"
              : "text-muted-foreground/40"
          )}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEdit ? (
            "수정"
          ) : (
            "저장"
          )}
        </button>
      </div>

      <div className="space-y-4 px-4 pt-5">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            제목 <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="설교 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Sermon Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            설교 날짜 <span className="text-destructive">*</span>
          </label>
          <Input
            type="date"
            value={sermonDate}
            onChange={(e) => setSermonDate(e.target.value)}
          />
        </div>

        {/* Preacher & Service Type - row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              설교자
            </label>
            <Input
              placeholder="목사님 이름"
              value={preacher}
              onChange={(e) => setPreacher(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="relative space-y-1.5" ref={serviceTypeRef}>
            <label className="text-xs font-semibold text-muted-foreground">
              예배 종류
            </label>
            <Input
              placeholder="예: 주일 1부"
              value={serviceType}
              onChange={(e) => {
                setServiceType(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              maxLength={50}
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg border border-border bg-background shadow-md">
                {filteredSuggestions.map((s) => (
                  <button
                    key={s}
                    className="block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => {
                      setServiceType(s);
                      setShowSuggestions(false);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scripture */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            본문 말씀
          </label>
          <Input
            placeholder="예: 요한복음 3:16-17"
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
            maxLength={200}
          />
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            나의 노트 <span className="text-destructive">*</span>
          </label>
          <Textarea
            placeholder="설교를 들으며 느낀 점, 깨달은 점을 자유롭게 적어보세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );
}

export default CreateSermonNotePage;
