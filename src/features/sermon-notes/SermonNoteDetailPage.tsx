import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Loader2, Calendar, User as UserIcon, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sermonNotesApi, ApiError } from "@/lib/api";
import { toast } from "sonner";
import type { SermonNote } from "@/types";

function SermonNoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<SermonNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await sermonNotesApi.getById(id);
        setNote(data);
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

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await sermonNotesApi.delete(id);
      toast.success("설교 노트가 삭제되었습니다.");
      navigate("/sermon-notes");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "삭제에 실패했습니다."
      );
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!note) return null;

  const d = new Date(note.sermonDate + "T00:00:00");
  const dateStr = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;

  const paragraphs = note.content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="min-h-dvh pb-8">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/40 bg-background/95 px-4 py-3 backdrop-blur-md">
        <button
          onClick={() => navigate("/sermon-notes")}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          목록
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/sermon-notes/${id}/edit`)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-6">
        {/* Hero Section */}
        <div className="mb-6 space-y-4">
          {note.serviceType && (
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {note.serviceType}
            </span>
          )}
          <h1 className="text-2xl font-bold leading-tight tracking-tight">
            {note.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {dateStr}
            </span>
            {note.preacher && (
              <span className="flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5" />
                {note.preacher}
              </span>
            )}
          </div>
        </div>

        {/* Scripture Card */}
        {note.scripture && (
          <div className="mb-6 rounded-xl border border-primary/15 bg-primary/[0.03] px-4 py-3.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary/60">
              <BookOpen className="h-3.5 w-3.5" />
              본문 말씀
            </div>
            <p className="mt-1.5 text-[15px] font-medium leading-snug text-foreground">
              {note.scripture}
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/50" />
          <BookOpen className="h-3.5 w-3.5 text-muted-foreground/30" />
          <div className="h-px flex-1 bg-border/50" />
        </div>

        {/* Content */}
        <article className="space-y-4 pb-4">
          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className="whitespace-pre-wrap text-[15px] leading-[1.8] text-foreground/85"
            >
              {paragraph}
            </p>
          ))}
        </article>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>설교 노트 삭제</DialogTitle>
            <DialogDescription>
              이 설교 노트를 삭제하시겠습니까?
              <br />
              삭제된 노트는 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "삭제"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SermonNoteDetailPage;
