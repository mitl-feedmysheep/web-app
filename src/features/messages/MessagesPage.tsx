import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { messagesApi } from "@/lib/api";

interface MessageItem {
  id: string;
  senderName: string;
  receiverName: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

type Tab = "received" | "sent";

const TYPE_EMOJI: Record<string, string> = {
  BIRTHDAY: "🎉",
};

function MessagesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("received");
  const [received, setReceived] = useState<MessageItem[]>([]);
  const [sent, setSent] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [r, s] = await Promise.allSettled([
        messagesApi.getMyMessages(),
        messagesApi.getSentMessages(),
      ]);
      setReceived(r.status === "fulfilled" ? r.value : []);
      setSent(s.status === "fulfilled" ? s.value : []);
      setLoading(false);
    };
    load();
  }, []);

  const handleOpen = (msg: MessageItem) => {
    if (msg.isRead) return;
    setReceived((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
    );
    messagesApi.markAsRead(msg.id).catch(() => {});
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
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

  const messages = tab === "received" ? received : sent;

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
        <h1 className="text-lg font-bold">메시지함</h1>
      </div>

      <div className="mb-4 flex rounded-lg bg-muted p-1">
        <button
          type="button"
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === "received"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setTab("received")}
        >
          받은 메세지({received.length})
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            tab === "sent"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setTab("sent")}
        >
          보낸 메세지({sent.length})
        </button>
      </div>

      {messages.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {tab === "received"
            ? "받은 메시지가 없습니다."
            : "보낸 메시지가 없습니다."}
        </p>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => {
            const emoji = TYPE_EMOJI[msg.type] ?? "💬";

            if (tab === "received" && !msg.isRead) {
              return (
                <button
                  key={msg.id}
                  type="button"
                  className="w-full rounded-lg bg-primary/5 px-3 py-3 text-left ring-1 ring-primary/20 transition-colors hover:bg-primary/10"
                  onClick={() => handleOpen(msg)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{emoji}</span>
                    <span className="flex-1 text-sm font-semibold">
                      {msg.senderName}님으로부터 온 메세지
                    </span>
                    <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </button>
              );
            }

            const displayName =
              tab === "received" ? msg.senderName : msg.receiverName;
            const label =
              tab === "sent" ? `To. ${displayName}` : displayName;

            return (
              <div
                key={msg.id}
                className="rounded-lg bg-accent/30 px-3 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{emoji}</span>
                  <span className="flex-1 text-sm text-muted-foreground">
                    {label}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5 pl-7 text-sm text-foreground">
                  {msg.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MessagesPage;
