import { Bell, ChevronRight, CircleHelp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import MockBottomNav from "../MockBottomNav";

function NotificationSlide() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-hidden">
        <div className="space-y-6 px-4 py-6">
          <section className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">매일 기도제목 알림</h2>
              <p className="text-sm text-muted-foreground">기억하게 해주는 작은 알림</p>
            </div>
          </section>

          <div data-highlight className="space-y-4">
            <Card className="border-0 shadow-md shadow-primary/5">
              <CardContent className="p-0">
                <div className="flex w-full items-center gap-3 px-4 py-3.5">
                  <Bell className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">알림 받기</span>
                    <p className="text-xs text-muted-foreground">
                      매일 오전 9시, 이번 주 기도제목을 알려드려요.
                    </p>
                  </div>
                  <Switch checked={false} disabled aria-hidden />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md shadow-primary/5">
              <CardContent className="p-0">
                <button className="flex w-full items-center gap-3 px-4 py-3.5">
                  <CircleHelp className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-left text-sm font-medium">앱 사용법 보기</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-xs text-muted-foreground leading-relaxed px-2">
            MY 탭 → 알림 받기를 켜면<br />
            소그룹 기도제목을 매일 아침 받아볼 수 있어요
          </p>
        </div>
      </div>

      <MockBottomNav activeTab="/my" />
    </div>
  );
}

export default NotificationSlide;
