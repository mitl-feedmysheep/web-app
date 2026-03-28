import { Users, HandHeart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MockBottomNav from "../MockBottomNav";

const MY_GROUPS = [
  { id: "1", name: "1셀", memberCount: 8, description: "청년부 1셀", type: "NORMAL" },
  { id: "2", name: "새가족반", memberCount: 4, description: "청년부 새가족반", type: "NEWCOMER" },
];

const ALL_GROUPS = [
  { groupId: "1", groupName: "1셀", leaderName: "김철수" },
  { groupId: "2", groupName: "2목장", leaderName: "이영희" },
  { groupId: "3", groupName: "새가족반", leaderName: "박민준" },
];

const TYPE_CONFIG = {
  NORMAL: {
    icon: Users,
    bgColor: "bg-primary/10",
    iconColor: "text-primary",
    badgeClass: "border-sky-200 bg-sky-100 text-sky-700",
    label: "소모임",
  },
  NEWCOMER: {
    icon: HandHeart,
    bgColor: "bg-rose-100",
    iconColor: "text-rose-500",
    badgeClass: "border-rose-200 bg-rose-100 text-rose-700",
    label: "새가족부",
  },
};

function GroupSlide() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-hidden">
        <div className="space-y-4 px-4 py-6">
          <div>
            <h1 className="text-lg font-bold">소그룹</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <span className="font-semibold text-sky-700">청년부</span>
              {" · 내가 속한 부서에요"}
            </p>
          </div>

          <div data-highlight="">
            {/* 부서 소모임 현황 */}
            <div className="rounded-xl border border-border/60 bg-card p-3.5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">우리 교회 소모임 {ALL_GROUPS.length}개</span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {ALL_GROUPS.map((g) => (
                  <div
                    key={g.groupId}
                    className="flex w-[calc(50%-3px)] items-center gap-1.5 rounded-full bg-accent/60 px-2.5 py-1"
                  >
                    <span className="truncate text-xs font-medium">{g.groupName}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      <span className="text-[11px] text-muted-foreground">{g.leaderName}</span>
                      <span className="translate-y-px rounded-sm bg-primary/15 px-1 py-px text-[9px] font-semibold leading-normal text-primary">리더</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">나의 소그룹 {MY_GROUPS.length}개</p>

            <div className="mt-2 space-y-3">
              {MY_GROUPS.map((group) => {
                const cfg = TYPE_CONFIG[group.type as keyof typeof TYPE_CONFIG];
                return (
                  <Card
                    key={group.id}
                    className="cursor-pointer border-0 shadow-md shadow-primary/5"
                  >
                    <CardContent className="flex items-center gap-4 py-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${cfg.bgColor}`}>
                        <cfg.icon className={`h-7 w-7 ${cfg.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{group.name}</h3>
                          <Badge variant="outline" className={`text-[10px] ${cfg.badgeClass}`}>
                            {cfg.label}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {group.memberCount}명
                          </span>
                          <span className="line-clamp-1">{group.description}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <MockBottomNav activeTab="/groups" groupLabel="청년부" />
    </div>
  );
}

export default GroupSlide;
