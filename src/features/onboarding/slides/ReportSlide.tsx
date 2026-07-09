import { Bell, ChevronRight, CircleHelp, MessageSquareWarning } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import MockBottomNav from "../MockBottomNav";

function ReportSlide() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-hidden">
        <div className="space-y-4 px-4 py-6">
          <Card className="border-0 shadow-md shadow-primary/5">
            <CardContent className="p-0">
              <div className="flex w-full items-center gap-3 px-4 py-3.5">
                <Bell className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-left text-sm font-medium">알림 설정</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <div data-highlight="">
            <Card className="border-0 shadow-md shadow-primary/5">
              <CardContent className="p-0">
                <div className="flex w-full items-center gap-3 px-4 py-3.5">
                  <MessageSquareWarning className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-left text-sm font-medium">버그 신고 · 기능 요청</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-md shadow-primary/5">
            <CardContent className="p-0">
              <div className="flex w-full items-center gap-3 px-4 py-3.5">
                <CircleHelp className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-left text-sm font-medium">앱 사용법 보기</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MockBottomNav activeTab="/my" />
    </div>
  );
}

export default ReportSlide;
