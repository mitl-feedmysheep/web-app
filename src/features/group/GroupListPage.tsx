import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2, HandHeart } from "lucide-react";
import { groupsApi, churchesApi } from "@/lib/api";
import type { Group, GroupType } from "@/types";

interface GroupLeaderInfo {
  groupId: string;
  groupName: string;
  leaderName: string | null;
}

function getGroupTypeConfig(type?: GroupType) {
  switch (type) {
    case "NEWCOMER":
      return {
        icon: HandHeart,
        bgColor: "bg-rose-100 dark:bg-rose-950/40",
        iconColor: "text-rose-500 dark:text-rose-400",
        label: "새가족부",
        badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      };
    default:
      return {
        icon: Users,
        bgColor: "bg-primary/10",
        iconColor: "text-primary",
        label: "소모임",
        badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200 dark:border-sky-800",
      };
  }
}

function GroupListPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<GroupLeaderInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const churchId = localStorage.getItem("churchId");
        if (!churchId) return;
        const [myGroups, churchGroups] = await Promise.all([
          groupsApi.getGroupsByChurch(churchId),
          churchesApi.getGroupsWithLeaders(churchId),
        ]);
        setGroups(myGroups);
        setAllGroups(churchGroups);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-6">
      <h1 className="text-lg font-bold">소그룹</h1>

      {allGroups.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-3.5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">
              우리 교회 소모임 {allGroups.length}개
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {allGroups.map((g) => (
              <div
                key={g.groupId}
                className="flex w-[calc(50%-3px)] items-center gap-1.5 rounded-full bg-accent/60 px-2.5 py-1"
              >
                <span className="text-xs font-medium truncate">{g.groupName}</span>
                {g.leaderName && (
                  <span className="flex items-center gap-1 shrink-0">
                    <span className="text-[11px] text-muted-foreground">{g.leaderName}</span>
                    <span className="rounded-sm bg-primary/15 px-1 py-px text-[9px] font-semibold leading-normal text-primary translate-y-px">리더</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        나의 소그룹 {groups.length}개
      </p>

      {groups.map((group) => {
        const typeConfig = getGroupTypeConfig(group.type);
        return (
          <Card
            key={group.id}
            className="cursor-pointer border-0 shadow-md shadow-primary/5 transition-all hover:shadow-lg active:scale-[0.98]"
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            <CardContent className="flex items-center gap-4 py-4">
              {group.imageUrl ? (
                <img
                  src={group.imageUrl}
                  alt={group.name}
                  className="h-14 w-14 rounded-2xl object-cover"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${typeConfig.bgColor}`}>
                  <typeConfig.icon className={`h-7 w-7 ${typeConfig.iconColor}`} />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{group.name}</h3>
                  <Badge variant="outline" className={`text-[10px] ${typeConfig.badgeClass}`}>
                    {typeConfig.label}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {group.groupMemberCount}명
                  </span>
                  {group.description && (
                    <span className="line-clamp-1">{group.description}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {groups.length === 0 && (
        <div className="py-20 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            소속된 소그룹이 없어요
          </p>
        </div>
      )}
    </div>
  );
}

export default GroupListPage;
