import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Megaphone, ChevronRight } from "lucide-react";
import { announcementsApi } from "@/lib/api";
import type { AnnouncementItem } from "@/lib/api";

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function AnnouncementsPage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const departmentId = localStorage.getItem("departmentId");
        if (!departmentId) return;
        const items = await announcementsApi.getList("DEPARTMENT", departmentId);
        setAnnouncements(items);
      } catch {
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-dvh pb-8">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/40 bg-background/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4" />
          <h1 className="text-base font-semibold">공지사항</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex min-h-[60dvh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : announcements.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            공지사항이 없습니다.
          </p>
        ) : (
          <div className="divide-y divide-border/50">
            {announcements.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex w-full items-start justify-between gap-2 py-4 text-left hover:bg-accent/30 transition-colors -mx-4 px-4"
                onClick={() => navigate(`/announcements/${item.id}`)}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{item.body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {formatDate(item.sendAt)}
                  </p>
                </div>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnnouncementsPage;
