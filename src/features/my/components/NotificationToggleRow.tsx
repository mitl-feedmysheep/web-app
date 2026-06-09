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

export function NotificationToggleRow() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupported()) {
      setLoading(false);
      return;
    }
    const permission = getPermission();
    if (permission === "granted") {
      getSubscription().then((sub) => {
        setEnabled(sub !== null);
        setLoading(false);
      });
    } else {
      setEnabled(false);
      setLoading(false);
    }
  }, []);

  const handleToggle = async (checked: boolean) => {
    if (!isSupported()) return;

    const permission = getPermission();

    if (permission === "denied") {
      toast.error("브라우저 설정에서 알림을 허용해주세요.");
      return;
    }

    setLoading(true);
    try {
      if (checked) {
        const success = await subscribe();
        setEnabled(success);
        if (!success) {
          toast.error("알림 권한이 거부되었습니다.");
        }
      } else {
        await unsubscribe();
        setEnabled(false);
      }
    } catch {
      toast.error("알림 설정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported()) return null;

  return (
    <div className="flex w-full items-center gap-3 px-4 py-3.5">
      <Bell className="h-5 w-5 text-muted-foreground" />
      <div className="flex-1">
        <span className="text-sm font-medium">알림 받기</span>
        <p className="text-xs text-muted-foreground">매일 오전 9시, 이번 주 기도제목을 알려드려요.</p>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={loading}
        aria-label="알림 받기"
      />
    </div>
  );
}
