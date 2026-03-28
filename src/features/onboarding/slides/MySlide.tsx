import {
  UserPen,
  KeyRound,
  Church,
  Building2,
  ChevronRight,
  CircleHelp,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import MockBottomNav from "../MockBottomNav";

const MENU_ITEMS = [
  { icon: UserPen, label: "내 정보 수정" },
  { icon: KeyRound, label: "비밀번호 변경" },
  { icon: Church, label: "교회 전환" },
  { icon: Building2, label: "부서 전환" },
];

function MySlide() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-hidden">
        <div className="space-y-6 px-4 py-6">
          {/* 프로필 섹션 */}
          <section className="flex items-center gap-4">
            <Avatar className="h-16 w-16 bg-primary/10">
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                창수
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold">김창수</h2>
              <p className="text-sm text-muted-foreground">changsu@example.com</p>
              <p className="mt-0.5 text-xs font-medium text-primary">청년부</p>
            </div>
          </section>

          {/* 하이라이트: 내 정보 수정 ~ 앱 사용법 */}
          <div data-highlight="" className="space-y-4">
            <Card className="border-0 shadow-md shadow-primary/5">
              <CardContent className="p-0">
                {MENU_ITEMS.map(({ icon: Icon, label }, index) => (
                  <div key={label}>
                    <button className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent">
                      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-left text-sm font-medium">{label}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                    {index < MENU_ITEMS.length - 1 && <Separator className="mx-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md shadow-primary/5">
              <CardContent className="p-0">
                <button className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent">
                  <CircleHelp className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-left text-sm font-medium">앱 사용법 보기</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </CardContent>
            </Card>
          </div>

          <Button
            variant="ghost"
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </div>

      <MockBottomNav activeTab="/my" />
    </div>
  );
}

export default MySlide;
