import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Loader2 } from "lucide-react";
import { prayersApi, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { MyPrayer } from "@/types";

type FilterType = "praying" | "answered" | null;

function PrayerPage() {
  const [prayers, setPrayers] = useState<MyPrayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await prayersApi.getMyPrayers();
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
    setFilter((prev) => (prev === type ? null : type));
  };

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
    return true;
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
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">나의 기도제목</h1>
        <span className="text-sm text-muted-foreground">
          총 {prayers.length}개
        </span>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2">
        <button
          onClick={() => handleFilterClick("praying")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            filter === "praying"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          기도 중
        </button>
        <button
          onClick={() => handleFilterClick("answered")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            filter === "answered"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          응답됨
        </button>
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
  const createdDate = formatDateOnly(prayer.createdAt);
  const context = buildContext(prayer);

  return (
    <Card
      className={cn(
        "border-0 shadow-none transition-opacity",
        prayer.isAnswered ? "bg-accent/40" : "bg-accent/60"
      )}
    >
      <CardContent className="py-3">
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <Checkbox
              checked={prayer.isAnswered}
              onCheckedChange={() => onToggle(prayer)}
              disabled={toggling}
              className="h-5 w-5 rounded-full"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p
              className={cn(
                "text-sm font-medium leading-snug",
                prayer.isAnswered && "text-muted-foreground line-through"
              )}
            >
              {prayer.prayerRequest}
            </p>
            {prayer.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {prayer.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
              {context && (
                <>
                  <span>{context}</span>
                  <span>·</span>
                </>
              )}
              <span>{createdDate}</span>
            </div>
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

function formatDateOnly(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
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

function groupByMonth(prayers: MyPrayer[]): MonthGroup[] {
  const map = new Map<string, MyPrayer[]>();

  for (const prayer of prayers) {
    const d = new Date(prayer.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const existing = map.get(key);
    if (existing) {
      existing.push(prayer);
    } else {
      map.set(key, [prayer]);
    }
  }

  return Array.from(map.entries()).map(([key, items]) => {
    const [year, month] = key.split("-");
    return {
      label: `${year}년 ${parseInt(month)}월`,
      items,
    };
  });
}

export default PrayerPage;
