import { BookUser, Bell, Mail, Target, HandHeart, Cake, MessageSquareHeart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MockBottomNav from "../MockBottomNav";

interface HomeSlideProps {
  section: "summary" | "birthday";
}

function HomeSlide({ section }: HomeSlideProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-hidden">
        <div className="space-y-5 px-4 pt-6">

          {/* 인사 + 주간 요약 */}
          <section {...(section === "summary" ? { "data-highlight": "" } : {})}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">김창수님, 반가워요! 👋</h2>
              <div className="flex items-center gap-1">
                <button type="button" className="relative shrink-0 p-1.5 text-primary/70">
                  <BookUser className="h-5 w-5" />
                </button>
                <button type="button" className="relative shrink-0 p-1.5 text-primary/70">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">3</span>
                </button>
                <button type="button" className="relative shrink-0 p-1.5 text-primary/70">
                  <Mail className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="mt-2">
              <Card className="border-primary/20 bg-primary/5 gap-1 py-2.5">
                <CardHeader className="px-3">
                  <CardTitle className="flex items-baseline gap-2 text-sm font-semibold">
                    나의 한 주
                    <span className="text-[11px] font-normal text-muted-foreground">3/24 - 3/30</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 px-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Target className="h-3.5 w-3.5" />
                      <span>한주 목표</span>
                    </div>
                    <ul className="space-y-1">
                      {["성경 마태복음 5장 읽기", "매일 아침 30분 묵상하기"].map((g) => (
                        <li key={g} className="flex items-start gap-2 text-sm">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <HandHeart className="h-3.5 w-3.5" />
                      <span>기도제목</span>
                    </div>
                    <ul className="space-y-1">
                      <li className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        <span>부모님의 건강 회복을 위해</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 생일자 + 캘린더 */}
          <section {...(section === "birthday" ? { "data-highlight": "" } : {})}>
            <div className="mb-2 flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <Cake className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">3월 생일자 (2명)</h3>
              </div>
              <span className="flex items-center gap-0.5 pr-1 text-[11px] text-muted-foreground">
                아래의 <MessageSquareHeart className="inline h-3 w-3 text-pink-400" />을 눌러 축하해주세요!
              </span>
            </div>
            <div className="space-y-2">
              {[
                { name: "박서준", date: "3월 27일(목)", dday: "🎂 TODAY", sex: "M" },
                { name: "이지현", date: "3월 31일(월)", dday: "D-4", sex: "F" },
              ].map((m) => (
                <div key={m.name} className="flex items-center gap-2.5 rounded-lg bg-accent/50 px-3 py-2.5">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${m.sex === "M" ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"}`}>
                    {m.sex === "M" ? "남" : "여"}
                  </span>
                  <span className="text-sm font-medium">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.date}</span>
                  <span className={`ml-auto shrink-0 text-xs font-semibold ${m.dday.includes("TODAY") ? "text-red-500" : "text-primary/70"}`}>
                    {m.dday}
                  </span>
                  <button type="button" className="shrink-0 text-pink-400">
                    <MessageSquareHeart className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* 미니 캘린더 */}
            <div className="mt-4 rounded-xl border border-border/40 bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">2025년 3월</span>
                <span className="text-xs text-muted-foreground">교회 일정</span>
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                  <div key={d} className="py-1 text-[10px] font-medium text-muted-foreground">{d}</div>
                ))}
                {[24, 25, 26, 27, 28, 29, 30].map((d) => (
                  <div key={d} className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs ${d === 27 ? "bg-primary font-bold text-primary-foreground" : ""}`}>
                    {d}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-sky-50 px-2 py-1.5 dark:bg-sky-950">
                <div className="h-2 w-2 rounded-full bg-sky-400" />
                <span className="text-[11px] font-medium">3/27 청년부 수요 예배</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <MockBottomNav activeTab="/" />
    </div>
  );
}

export default HomeSlide;
