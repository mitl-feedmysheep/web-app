import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Plus, Loader2, Calendar, User as UserIcon } from "lucide-react";
import { sermonNotesApi, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SermonNote } from "@/types";

function SermonNotesPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<SermonNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await sermonNotesApi.getMySermonNotes();
        setNotes(data);
      } catch (err) {
        toast.error(
          err instanceof ApiError
            ? err.message
            : "설교 노트를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const grouped = groupByMonth(notes);

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 py-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">나의 설교 노트</h1>
          <p className="mt-1 text-[9.5px] text-muted-foreground/70 leading-relaxed">
            네 말씀은 내 발에 등이요 내 길에 빛이니이다 (시편 119:105)
          </p>
        </div>
        <button
          onClick={() => navigate("/sermon-notes/create")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {notes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {grouped.map(({ label, items }) => (
            <div key={label} className="space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground">
                {label}
              </p>
              <div className="space-y-2">
                {items.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onClick={() => navigate(`/sermon-notes/${note.id}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({
  note,
  onClick,
}: {
  note: SermonNote;
  onClick: () => void;
}) {
  const d = new Date(note.sermonDate + "T00:00:00");
  const dateStr = `${d.getMonth() + 1}월 ${d.getDate()}일`;

  return (
    <Card
      className="cursor-pointer border border-transparent bg-accent/60 shadow-none transition-all hover:bg-accent/80 active:scale-[0.99]"
      onClick={onClick}
    >
      <CardContent className="py-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug line-clamp-1">
              {note.title}
            </p>
            {note.serviceType && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {note.serviceType}
              </span>
            )}
          </div>

          {note.scripture && (
            <p className="text-xs text-foreground/70 line-clamp-1">
              📖 {note.scripture}
            </p>
          )}

          <p className="text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed">
            {note.content}
          </p>

          <div className="flex items-center gap-3 pt-0.5">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
              <Calendar className="h-3 w-3" />
              {dateStr}
            </span>
            {note.preacher && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                <UserIcon className="h-3 w-3" />
                {note.preacher}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[40dvh] flex-col items-center justify-center px-4">
      <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/30" />
      <p className="text-lg font-semibold text-foreground">
        설교 노트가 없습니다
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        주일 설교를 듣고 노트를 작성해보세요
      </p>
      <button
        onClick={() => navigate("/sermon-notes/create")}
        className={cn(
          "mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
          "transition-colors hover:bg-primary/90"
        )}
      >
        첫 노트 작성하기
      </button>
    </div>
  );
}

interface MonthGroup {
  label: string;
  items: SermonNote[];
}

function groupByMonth(notes: SermonNote[]): MonthGroup[] {
  const map = new Map<string, SermonNote[]>();

  for (const note of notes) {
    const d = new Date(note.sermonDate + "T00:00:00");
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const existing = map.get(key);
    if (existing) {
      existing.push(note);
    } else {
      map.set(key, [note]);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => {
      items.sort(
        (a, b) =>
          new Date(b.sermonDate + "T00:00:00").getTime() -
          new Date(a.sermonDate + "T00:00:00").getTime()
      );
      const [year, month] = key.split("-");
      return {
        label: `${year}년 ${parseInt(month)}월`,
        items,
      };
    });
}

export default SermonNotesPage;
