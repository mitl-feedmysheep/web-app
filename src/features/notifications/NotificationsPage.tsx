import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { notificationsApi } from "@/lib/api";

interface NotificationItem {
  id: string;
  type: string;
  description?: string | null;
  entityType: string;
  entityId: string;
  targetUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

const TYPE_MESSAGE: Record<string, string> = {
  ADMIN_COMMENT: "목회자 코멘트가 등록되었어요 😊",
  GATHERING_USER_CARD_UPDATED: "나의 소모임 정보가 업데이트 되었어요 😊",
};

function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await notificationsApi.getMyNotifications();
        setNotifications(data);
      } catch {
        setNotifications([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      notificationsApi.markAsRead(item.id).catch(() => {});
    }
    if (item.targetUrl) {
      const separator = item.targetUrl.includes("?") ? "&" : "?";
      navigate(`${item.targetUrl}${separator}from=${item.type}`);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "방금 전";
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">알림</h1>
      </div>

      {notifications.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          알림이 없습니다.
        </p>
      ) : (
        <div className="space-y-2">
          {notifications.map((item) => {
            const message = TYPE_MESSAGE[item.type] ?? item.type;

            if (!item.isRead) {
              return (
                <button
                  key={item.id}
                  type="button"
                  className="w-full rounded-lg bg-primary/5 px-3 py-3 text-left ring-1 ring-primary/20 transition-colors hover:bg-primary/10"
                  onClick={() => handleClick(item)}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-sm font-semibold">
                      {message}
                    </span>
                    <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatTime(item.createdAt)}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                  {item.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </button>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                className="w-full rounded-lg bg-accent/30 px-3 py-3 text-left"
                onClick={() => handleClick(item)}
              >
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm text-muted-foreground">
                    {message}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatTime(item.createdAt)}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
                {item.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
