import { Calendar, MapPin, Clock, ChevronLeft, ChevronUp, Heart, Target, FileText, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import MockBottomNav from "../MockBottomNav";
import { cn } from "@/lib/utils";

function AttendanceChip({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium",
        checked ? "bg-muted text-foreground" : "text-muted-foreground"
      )}
    >
      <div
        className={cn(
          "flex h-[18px] w-[18px] items-center justify-center rounded transition-colors",
          checked ? "bg-primary" : "bg-muted-foreground/20"
        )}
      >
        {checked && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
      </div>
      {label}
    </div>
  );
}

function GatheringSlide() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-hidden">
        <div className="space-y-4 px-4 py-4">
          {/* 상단 네비게이션 */}
          <button className="flex items-center gap-1 text-sm text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
            모임 목록
          </button>

          {/* 모임 정보 카드 */}
          <Card className="border-0 shadow-md shadow-primary/5">
            <CardContent className="space-y-2.5 py-4">
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="h-4 w-4 shrink-0 text-primary" />
                <span className="font-medium">2025년 3월 20일 (목)</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>교회 2층 소그룹 룸</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                <span>오후 7:00 – 9:00</span>
              </div>
            </CardContent>
          </Card>

          {/* 오늘의 기록 */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">오늘의 기록</h2>
            <div className="relative flex h-8 w-[140px] items-center rounded-full bg-muted p-0.5">
              <div className="absolute top-0.5 left-0.5 h-7 w-[calc(50%-2px)] rounded-full bg-primary shadow-sm transition-all duration-200" />
              <span className="relative z-10 flex-1 text-center text-xs font-medium text-primary-foreground">전체</span>
              <span className="relative z-10 flex-1 text-center text-xs font-medium text-muted-foreground">기도제목</span>
            </div>
          </div>

          {/* 멤버 카드들 */}
          <div className="space-y-3">
            {/* 열린 카드 - data-highlight */}
            <Card data-highlight="" className="border-0 bg-accent/40 shadow-none">
              <CardContent className="py-3">
                {/* 헤더 */}
                <div className="flex cursor-pointer items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-medium text-primary">
                      길동
                    </div>
                    <p className="font-semibold">홍길동</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <AttendanceChip label="예배" checked={true} />
                    <AttendanceChip label="모임" checked={true} />
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* 확장된 내용 */}
                <div className="mt-4 space-y-3 border-t border-border/50 pt-4">
                  {/* 나눔 */}
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                      <FileText className="h-3 w-3" />
                      나눔
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      이번 주에 직장에서 힘든 일이 있었지만 예배를 통해 위로를 받았어요.
                    </p>
                  </div>
                  {/* 한주 목표 */}
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                      <Target className="h-3 w-3" />
                      한주 목표
                    </p>
                    <p className="text-xs text-muted-foreground">매일 성경 1장 읽기</p>
                  </div>
                  {/* 기도제목 */}
                  <div>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                      <Heart className="h-3 w-3" />
                      기도제목
                    </p>
                    <div className="space-y-1">
                      {[
                        "직장 동료의 복음화를 위해 기도합니다.",
                        "부모님의 건강 회복을 위해 기도합니다.",
                      ].map((p) => (
                        <div key={p} className="flex items-start gap-2 rounded-lg bg-background px-3 py-2">
                          <Heart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="text-xs">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <MockBottomNav activeTab="/groups" groupLabel="청년부" />
    </div>
  );
}

export default GatheringSlide;
