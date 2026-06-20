import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, BookOpen, BookMarked } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { isSupported, getPermission, getSubscription, subscribe, unsubscribe } from "@/lib/push";
import { pushApi, readingApi } from "@/lib/api";

function NotificationSettingsPage() {
  const navigate = useNavigate();
  const [subscribed, setSubscribed] = useState(false);
  const [prayerEnabled, setPrayerEnabled] = useState(false);
  const [readingEnabled, setReadingEnabled] = useState(false);
  const [readingAvailable, setReadingAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [prayerLoading, setPrayerLoading] = useState(false);
  const [readingLoading, setReadingLoading] = useState(false);

  useEffect(() => {
    if (!isSupported()) {
      setLoading(false);
      return;
    }
    if (getPermission() !== "granted") {
      setLoading(false);
      return;
    }

    const departmentId = localStorage.getItem("departmentId") ?? "";
    const readingStatusPromise = departmentId
      ? readingApi.getStatus(departmentId).catch(() => false)
      : Promise.resolve(false);

    Promise.all([getSubscription(), pushApi.getTopics(), readingStatusPromise])
      .then(([sub, topics, hasReadingPlan]) => {
        setSubscribed(sub !== null);
        setPrayerEnabled(topics.includes("PRAYER"));
        setReadingEnabled(topics.includes("READING"));
        setReadingAvailable(hasReadingPlan);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribeToggle = async (checked: boolean) => {
    if (!isSupported()) return;
    if (getPermission() === "denied") {
      toast.error("브라우저 설정에서 알림을 허용해주세요.");
      return;
    }
    setLoading(true);
    try {
      if (checked) {
        const success = await subscribe();
        setSubscribed(success);
        if (success) toast.success("알림이 활성화됐어요.");
        else toast.error("알림 권한이 거부되었습니다.");
      } else {
        await unsubscribe();
        setSubscribed(false);
        setPrayerEnabled(false);
        setReadingEnabled(false);
        toast.success("알림이 비활성화됐어요.");
      }
    } catch (e) {
      toast.error("알림 설정 중 오류가 발생했습니다: " + String(e));
    } finally {
      setLoading(false);
    }
  };

  const handlePrayerToggle = async (checked: boolean) => {
    setPrayerLoading(true);
    try {
      if (checked) {
        await pushApi.subscribeTopic("PRAYER");
        setPrayerEnabled(true);
        toast.success("기도제목 매일 알림이 활성화됐어요.");
      } else {
        await pushApi.unsubscribeTopic("PRAYER");
        setPrayerEnabled(false);
        toast.success("기도제목 매일 알림이 비활성화됐어요.");
      }
    } catch {
      toast.error("기도제목 알림 설정 중 오류가 발생했습니다.");
    } finally {
      setPrayerLoading(false);
    }
  };

  const handleReadingToggle = async (checked: boolean) => {
    setReadingLoading(true);
    try {
      if (checked) {
        await pushApi.subscribeTopic("READING");
        setReadingEnabled(true);
        toast.success("리딩지저스 매일 알림이 활성화됐어요.");
      } else {
        await pushApi.unsubscribeTopic("READING");
        setReadingEnabled(false);
        toast.success("리딩지저스 매일 알림이 비활성화됐어요.");
      }
    } catch {
      toast.error("리딩지저스 알림 설정 중 오류가 발생했습니다.");
    } finally {
      setReadingLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="flex items-center gap-2 px-4 py-4 border-b">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">알림 설정</h1>
      </header>

      <div className="flex-1 px-4 py-6 space-y-3">
        {!isSupported() ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            이 브라우저는 푸시 알림을 지원하지 않아요.
          </p>
        ) : (
          <>
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 px-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">알림 동의</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    목사님·운영진이 보내는 공지 알림을 받아볼 수 있어요.
                  </p>
                </div>
                <Switch
                  checked={subscribed}
                  onCheckedChange={handleSubscribeToggle}
                  disabled={loading}
                  aria-label="알림 동의"
                />
              </div>
            </div>

            <div className={`rounded-2xl border bg-card shadow-sm overflow-hidden transition-opacity ${!subscribed ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-center gap-4 px-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">기도제목 매일 알림</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    매일 오전 9시, 이번 주 나의 기도제목을 알려드려요.
                  </p>
                </div>
                <Switch
                  checked={prayerEnabled}
                  onCheckedChange={handlePrayerToggle}
                  disabled={prayerLoading || !subscribed}
                  aria-label="기도제목 매일 알림"
                />
              </div>
            </div>

            <div className={`rounded-2xl border bg-card shadow-sm overflow-hidden transition-opacity ${!subscribed || !readingAvailable ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-center gap-4 px-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <BookMarked className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">성경읽기 매일 알림</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {readingAvailable
                      ? "매일 오전 8시, 오늘 읽을 성경 분량을 알려드려요."
                      : "부서에 성경읽기 플랜이 없어요."}
                  </p>
                </div>
                <Switch
                  checked={readingEnabled}
                  onCheckedChange={handleReadingToggle}
                  disabled={readingLoading || !subscribed || !readingAvailable}
                  aria-label="리딩지저스 매일 알림"
                />
              </div>
            </div>

            {!subscribed && (
              <p className="text-xs text-muted-foreground text-center px-4">
                알림 동의를 먼저 켜야 세부 알림을 설정할 수 있어요.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default NotificationSettingsPage;
