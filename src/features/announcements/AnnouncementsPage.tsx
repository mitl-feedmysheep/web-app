import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, Megaphone, Bell, ChevronRight } from "lucide-react";
import { announcementsApi } from "@/lib/api";
import type { AnnouncementItem } from "@/lib/api";

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function AnnouncementList({ type }: { type: "ANNOUNCEMENT" | "BROADCAST" }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const departmentId = localStorage.getItem("departmentId");
        if (!departmentId) return;
        const data = await announcementsApi.getList("DEPARTMENT", departmentId, type);
        setItems(data);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type]);

  if (loading) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {type === "ANNOUNCEMENT" ? "공지사항이 없습니다." : "전체알림이 없습니다."}
      </p>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="flex w-full items-start justify-between gap-2 py-4 text-left hover:bg-accent/30 transition-colors -mx-4 px-4"
          onClick={() => navigate(`/announcements/${item.id}`)}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium line-clamp-1">{item.title}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/70">
              {formatDate(item.sendAt)}
            </p>
          </div>
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
        </button>
      ))}
    </div>
  );
}

function AnnouncementsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("tab") ?? "announcement") as "announcement" | "broadcast";

  const setTab = (t: "announcement" | "broadcast") => {
    setSearchParams({ tab: t }, { replace: true });
  };

  return (
    <div className="min-h-dvh pb-8">
      <div className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-base font-semibold">공지</h1>
        </div>

        <div className="flex">
          <button
            type="button"
            onClick={() => setTab("announcement")}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              tab === "announcement"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Megaphone className="h-3.5 w-3.5" />
            공지사항
          </button>
          <button
            type="button"
            onClick={() => setTab("broadcast")}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              tab === "broadcast"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            전체알림
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {tab === "announcement" ? (
          <AnnouncementList type="ANNOUNCEMENT" />
        ) : (
          <AnnouncementList type="BROADCAST" />
        )}
      </div>
    </div>
  );
}

export default AnnouncementsPage;
