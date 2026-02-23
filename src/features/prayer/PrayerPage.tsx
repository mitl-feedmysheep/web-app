import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Loader2, CheckCircle2, Circle } from "lucide-react";
import { prayersApi, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MyPrayer } from "@/types";

type FilterType = "all" | "praying" | "answered";

function PrayerPage() {
  const [prayers, setPrayers] = useState<MyPrayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await prayersApi.getMyPrayers();
        console.log(data);
        setPrayers(data);
      } catch (err) {
        toast.error(
          err instanceof ApiError
            ? err.message
            : "기도제목을 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFilterClick = (type: FilterType) => {
    setFilter(type);
  };

  const prayingCount = prayers.filter((p) => !p.isAnswered).length;
  const answeredCount = prayers.filter((p) => p.isAnswered).length;

  const handleToggleAnswered = useCallback(
    async (prayer: MyPrayer) => {
      const newValue = !prayer.isAnswered;
      setTogglingId(prayer.id);

      setPrayers((prev) =>
        prev.map((p) =>
          p.id === prayer.id ? { ...p, isAnswered: newValue } : p
        )
      );

      try {
        await prayersApi.updateAnswered(prayer.id, newValue);
      } catch (err) {
        setPrayers((prev) =>
          prev.map((p) =>
            p.id === prayer.id ? { ...p, isAnswered: !newValue } : p
          )
        );
        toast.error(
          err instanceof ApiError ? err.message : "업데이트에 실패했습니다."
        );
      } finally {
        setTogglingId(null);
      }
    },
    []
  );

  const filteredPrayers = prayers.filter((p) => {
    if (filter === "praying") return !p.isAnswered;
    if (filter === "answered") return p.isAnswered;
    return true; // "all"
  });

  const grouped = groupByMonth(filteredPrayers);

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 py-4 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold">나의 기도제목</h1>
        <p className="mt-1 text-[9.5px] text-muted-foreground/70 leading-relaxed">
          그들이 부르기 전에 내가 응답하겠고 그들이 말을 마치기 전에 내가 들을 것이며 (이사야 65:24)
          {/* <span className="block text-right text-[10px] mt-0.5 not-italic">(이사야 65:24)</span> */}
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2">
        {(
          [
            { type: "all" as FilterType, label: "전체", count: prayers.length },
            { type: "praying" as FilterType, label: "기도 중", count: prayingCount },
            { type: "answered" as FilterType, label: "응답됨", count: answeredCount },
          ] as const
        ).map(({ type, label, count }) => (
          <button
            key={type}
            onClick={() => handleFilterClick(type)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === type
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {label}({count}개)
          </button>
        ))}
      </div>

      {/* Prayer List */}
      {prayers.length === 0 ? (
        <EmptyState type="all" />
      ) : filteredPrayers.length === 0 ? (
        <EmptyState type="filtered" />
      ) : (
        <div className="space-y-6">
          {grouped.map(({ label, items }) => (
            <div key={label} className="space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground">
                {label}
              </p>
              <div className="space-y-2">
                {items.map((prayer) => (
                  <PrayerCard
                    key={prayer.id}
                    prayer={prayer}
                    toggling={togglingId === prayer.id}
                    onToggle={handleToggleAnswered}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PrayerCard({
  prayer,
  toggling,
  onToggle,
}: {
  prayer: MyPrayer;
  toggling: boolean;
  onToggle: (prayer: MyPrayer) => void;
}) {
  const context = buildContext(prayer);

  return (
    <Card
      className={cn(
        "border shadow-none transition-all",
        prayer.isAnswered
          ? "border-primary/25 bg-primary/5"
          : "border-transparent bg-accent/60"
      )}
    >
      <CardContent className="py-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggle(prayer)}
            disabled={toggling}
            className="mt-0.5 shrink-0 cursor-pointer transition-colors"
          >
            {prayer.isAnswered ? (
              <CheckCircle2 className="h-6 w-6 text-primary" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground/40" />
            )}
          </button>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-medium leading-snug">
              {prayer.prayerRequest}
              {prayer.isAnswered && (
                <span className="ml-1.5 inline-flex items-center align-middle rounded-full bg-primary/15 px-1.5 py-px text-[10px] font-semibold text-primary leading-none">
                  응답됨
                </span>
              )}
            </p>
            {prayer.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {prayer.description}
              </p>
            )}
            {context && (
              <p className="text-xs text-muted-foreground/70">{context}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ type }: { type: "all" | "filtered" }) {
  return (
    <div className="flex min-h-[40dvh] flex-col items-center justify-center px-4">
      <Heart className="mb-4 h-12 w-12 text-muted-foreground/30" />
      <p className="text-lg font-semibold text-foreground">
        {type === "all" ? "기도제목이 없습니다" : "해당하는 기도제목이 없습니다"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {type === "all"
          ? "모임에서 기도제목을 나눠보세요"
          : "다른 필터를 선택해보세요"}
      </p>
    </div>
  );
}

function buildContext(prayer: MyPrayer): string | null {
  if (!prayer.groupName) return null;
  if (prayer.gatheringDate) {
    const d = new Date(prayer.gatheringDate + "T00:00:00");
    return `${prayer.groupName} · ${d.getMonth() + 1}월 ${d.getDate()}일 모임`;
  }
  return prayer.groupName;
}

interface MonthGroup {
  label: string;
  items: MyPrayer[];
}

function getGatheringDateKey(prayer: MyPrayer): string {
  if (prayer.gatheringDate) {
    const d = new Date(prayer.gatheringDate + "T00:00:00");
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  return "0000-00";
}

function getGatheringTimestamp(prayer: MyPrayer): number {
  if (prayer.gatheringDate) {
    return new Date(prayer.gatheringDate + "T00:00:00").getTime();
  }
  return 0;
}

function groupByMonth(prayers: MyPrayer[]): MonthGroup[] {
  const map = new Map<string, MyPrayer[]>();

  for (const prayer of prayers) {
    const key = getGatheringDateKey(prayer);
    const existing = map.get(key);
    if (existing) {
      existing.push(prayer);
    } else {
      map.set(key, [prayer]);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => {
      items.sort((a, b) => getGatheringTimestamp(b) - getGatheringTimestamp(a));
      if (key === "0000-00") {
        return { label: "기타", items };
      }
      const [year, month] = key.split("-");
      return {
        label: `${year}년 ${parseInt(month)}월`,
        items,
      };
    });
}

export default PrayerPage;
