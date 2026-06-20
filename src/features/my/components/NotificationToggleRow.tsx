import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  isSupported,
  getPermission,
  getSubscription,
  subscribe,
  unsubscribe,
} from "@/lib/push";
import { pushApi } from "@/lib/api";

export function NotificationToggleRow() {
  const [subscribed, setSubscribed] = useState(false);
  const [prayerEnabled, setPrayerEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [prayerLoading, setPrayerLoading] = useState(false);

  useEffect(() => {
    if (!isSupported()) {
      setLoading(false);
      return;
    }
    const permission = getPermission();
    if (permission !== "granted") {
      setLoading(false);
      return;
    }
    Promise.all([getSubscription(), pushApi.getTopics()])
      .then(([sub, topics]) => {
        setSubscribed(sub !== null);
        setPrayerEnabled(topics.includes("PRAYER"));
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
        if (!success) toast.error("알림 권한이 거부되었습니다.");
      } else {
        await unsubscribe();
        setSubscribed(false);
        setPrayerEnabled(false);
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
      } else {
        await pushApi.unsubscribeTopic("PRAYER");
        setPrayerEnabled(false);
      }
    } catch {
      toast.error("기도제목 알림 설정 중 오류가 발생했습니다.");
    } finally {
      setPrayerLoading(false);
    }
  };

  if (!isSupported()) return null;

  return (
    <div className="flex flex-col">
      <div className="flex w-full items-center gap-3 px-4 py-3.5">
        <Bell className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <span className="text-sm font-medium">알림 동의</span>
          <p className="text-xs text-muted-foreground">목사님·운영진 공지 알림을 받아볼 수 있어요.</p>
        </div>
        <Switch
          checked={subscribed}
          onCheckedChange={handleSubscribeToggle}
          disabled={loading}
          aria-label="알림 동의"
        />
      </div>

      {subscribed && (
        <div className="flex w-full items-center gap-3 px-4 py-3.5 pl-12">
          <div className="flex-1">
            <span className="text-sm font-medium">기도제목 매일 알림</span>
            <p className="text-xs text-muted-foreground">매일 오전 9시, 이번 주 나의 기도제목을 알려드려요.</p>
          </div>
          <Switch
            checked={prayerEnabled}
            onCheckedChange={handlePrayerToggle}
            disabled={prayerLoading}
            aria-label="기도제목 매일 알림"
          />
        </div>
      )}
    </div>
  );
}
