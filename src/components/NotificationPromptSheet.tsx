import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { subscribe } from "@/lib/push";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationPromptSheet({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    try {
      const success = await subscribe();
      if (!success) {
        toast.error("알림 권한이 거부되었습니다. MY 탭에서 다시 설정할 수 있어요.");
      }
    } catch {
      toast.error("알림 설정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" showCloseButton={false} className="rounded-t-2xl pb-10">
        <SheetHeader className="items-center pt-2 pb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-2">
            <Bell className="h-7 w-7 text-primary" />
          </div>
          <SheetTitle className="text-center text-lg">매일 기도제목 알림</SheetTitle>
          <SheetDescription className="text-center leading-relaxed">
            매일 오전 9시, 이번 주 기도제목을 알려드려요.{"\n"}
            알림을 허용하면 잊지 않고 복기할 수 있어요.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-2 px-4">
          <Button onClick={handleAllow} disabled={loading} className="w-full">
            알림 허용하기
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={loading} className="w-full text-muted-foreground">
            나중에 하기
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
