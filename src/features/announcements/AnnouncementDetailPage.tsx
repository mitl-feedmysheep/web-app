import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Calendar } from "lucide-react";
import { announcementsApi } from "@/lib/api";
import type { AnnouncementItem } from "@/lib/api";

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<AnnouncementItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await announcementsApi.getById(id);
        setAnnouncement(data);
      } catch {
        navigate("/announcements");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!announcement) return null;

  return (
    <div className="min-h-dvh pb-8">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/40 bg-background/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate("/announcements")}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          목록
        </button>
      </div>

      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold leading-tight">{announcement.title}</h1>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(announcement.sendAt)}
        </div>

        <div className="mt-6 h-px bg-border/50" />

        <p className="mt-6 whitespace-pre-wrap text-[15px] leading-[1.8] text-foreground/85">
          {announcement.body}
        </p>
      </div>
    </div>
  );
}

export default AnnouncementDetailPage;
