import { Heart, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import MockBottomNav from "../MockBottomNav";

const MOCK_PRAYERS = [
  {
    id: "1",
    prayerRequest: "부모님의 건강 회복을 위해 기도합니다.",
    isAnswered: false,
    groupName: "1목장",
    gatheringDate: "2025-03-20",
  },
  {
    id: "2",
    prayerRequest: "취업 준비 중인 친구를 위해 기도합니다.",
    isAnswered: false,
    groupName: "1목장",
    gatheringDate: "2025-03-20",
  },
  {
    id: "3",
    prayerRequest: "지난 시험 잘 마칠 수 있었습니다. 감사해요!",
    isAnswered: true,
    groupName: "1목장",
    gatheringDate: "2025-03-13",
  },
];

function PrayerSlide() {
  const prayingCount = MOCK_PRAYERS.filter((p) => !p.isAnswered).length;
  const answeredCount = MOCK_PRAYERS.filter((p) => p.isAnswered).length;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-hidden">
        <div className="space-y-5 px-4 py-6 pb-8">
          {/* 헤더 */}
          <div>
            <h1 className="text-lg font-bold">나의 기도제목</h1>
            <p className="mt-1 text-[9.5px] leading-relaxed text-muted-foreground/70">
              그들이 부르기 전에 내가 응답하겠고 그들이 말을 마치기 전에 내가 들을 것이며 (이사야 65:24)
            </p>
          </div>

          {/* 필터 + 목록 */}
          <div data-highlight>
            {/* 필터 칩 */}
            <div className="flex gap-2">
              {[
                { label: "전체", count: MOCK_PRAYERS.length, active: true },
                { label: "기도 중", count: prayingCount, active: false },
                { label: "응답됨", count: answeredCount, active: false },
              ].map(({ label, count, active }) => (
                <button
                  key={label}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  {label}({count}개)
                </button>
              ))}
            </div>

            {/* 기도제목 목록 */}
            <div className="mt-5 space-y-6">
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-muted-foreground">2025년 3월</p>
                <div className="space-y-2">
                  {MOCK_PRAYERS.map((prayer) => (
                    <Card
                      key={prayer.id}
                      className={cn(
                        "border shadow-none transition-all",
                        prayer.isAnswered
                          ? "border-primary/25 bg-primary/5"
                          : "border-transparent bg-accent/60"
                      )}
                    >
                      <CardContent className="py-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0">
                            {prayer.isAnswered ? (
                              <CheckCircle2 className="h-6 w-6 text-primary" />
                            ) : (
                              <Circle className="h-6 w-6 text-muted-foreground/40" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm font-medium leading-snug">
                              {prayer.prayerRequest}
                              {prayer.isAnswered && (
                                <span className="ml-1.5 inline-flex items-center align-middle rounded-full bg-primary/15 px-1.5 py-px text-[10px] font-semibold leading-none text-primary">
                                  응답됨
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              {prayer.groupName} · 3월 {prayer.gatheringDate.split("-")[2]}일 모임
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MockBottomNav activeTab="/prayers" />
    </div>
  );
}

export default PrayerSlide;
