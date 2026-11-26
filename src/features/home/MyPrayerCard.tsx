import { useNavigate } from "react-router-dom";
import { ChevronRight, HandHeart, PenLine, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { HomeMyPrayer } from "@/types";

interface MyPrayerCardProps {
  prayers: HomeMyPrayer[];
  totalCount: number;
}

/** 홈 "나의 기도" 섹션 (나의 한 주 위) */
export default function MyPrayerCard({ prayers, totalCount }: MyPrayerCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="gap-1 border-primary/20 py-2.5">
      <CardHeader className="flex flex-row items-center justify-between px-3">
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
          <HandHeart className="h-4 w-4 text-primary" />
          나의 기도
        </CardTitle>
        <button
          onClick={() => navigate("/prayers?write=1")}
          className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="나의 기도 쓰기"
        >
          <Plus className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="px-3">
        <ul className="space-y-1">
          {prayers.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => navigate(`/prayers?highlight=${p.id}`)}
                className="flex w-full items-start gap-2 text-left text-sm"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span className="line-clamp-2">{p.prayerRequest}</span>
              </button>
            </li>
          ))}
        </ul>
        {totalCount > prayers.length && (
          <button
            onClick={() => navigate("/prayers")}
            className="mt-1.5 flex w-full items-center justify-end gap-0.5 text-xs text-muted-foreground"
          >
            전체보기 ({totalCount})
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </CardContent>
    </Card>
  );
}

/** 이번 주 모임 기도제목도, 나의 기도도 없을 때 */
export function MyPrayerEmptyCard() {
  const navigate = useNavigate();

  return (
    <Card className="gap-1 border-dashed border-primary/30 py-3">
      <CardContent className="flex flex-col items-center gap-2 px-3 text-center">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          <HandHeart className="h-4 w-4 text-primary" />
          나의 기도
        </p>
        <p className="text-sm text-muted-foreground">
          마음에 있는 기도제목을
          <br />
          하나 적어볼까요?
        </p>
        <Button size="sm" className="gap-1" onClick={() => navigate("/prayers?write=1")}>
          <PenLine className="h-3.5 w-3.5" />
          기도제목 쓰기
        </Button>
      </CardContent>
    </Card>
  );
}
