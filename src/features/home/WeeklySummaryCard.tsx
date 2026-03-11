import type { HomeSummaryGoal, HomeSummaryPrayer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, HandHeart } from "lucide-react";

interface WeeklySummaryCardProps {
  goals: HomeSummaryGoal[];
  prayers: HomeSummaryPrayer[];
}

function getDateRange(): string {
  const now = new Date();
  const day = now.getDay(); // 0=일요일
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - day);
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(sunday)} - ${fmt(saturday)}`;
}

export default function WeeklySummaryCard({ goals, prayers }: WeeklySummaryCardProps) {
  const activePrayers = prayers.filter((p) => !p.isAnswered);

  if (goals.length === 0 && activePrayers.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5 py-2.5 gap-1">
      <CardHeader className="px-3">
        <CardTitle className="flex items-baseline gap-2 text-sm font-semibold">
          나의 한 주
          <span className="text-[11px] font-normal text-muted-foreground">{getDateRange()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 space-y-1.5">
        {goals.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              <span>한주 목표</span>
            </div>
            <ul className="space-y-1">
              {goals.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span>{g.goal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activePrayers.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <HandHeart className="h-3.5 w-3.5" />
              <span>기도제목</span>
            </div>
            <ul className="space-y-1">
              {activePrayers.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span>{p.prayerRequest}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
