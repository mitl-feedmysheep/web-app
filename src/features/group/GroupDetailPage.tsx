import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Loader2,
  ChevronLeft,
  Settings,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { groupsApi, educationApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { User, Gathering, EducationProgram } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  LEADER: "리더",
  SUB_LEADER: "부리더",
  MEMBER: "멤버",
};

const ROLE_RING: Record<string, string> = {
  LEADER: "ring-2 ring-primary ring-offset-2",
  SUB_LEADER: "ring-2 ring-primary/40 ring-offset-2",
};

function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const [members, setMembers] = useState<User[]>([]);
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [myInfo, setMyInfo] = useState<User | null>(null);
  const [educationProgram, setEducationProgram] = useState<EducationProgram | null>(null);
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const load = async () => {
      try {
        const [memberData, gatheringData, me] = await Promise.all([
          groupsApi.getGroupMembers(groupId),
          groupsApi.getGroupGatherings(groupId),
          groupsApi.getMyInfoInGroup(groupId),
        ]);
        setMembers(memberData);
        setGatherings(gatheringData);
        setMyInfo(me);

        const months = Array.from(
          new Set(gatheringData.map((g) => g.date.slice(0, 7)))
        ).sort((a, b) => b.localeCompare(a));
        if (months.length > 0) setMonth(months[0]);

        try {
          const program = await educationApi.getProgram(groupId);
          setEducationProgram(program);
        } catch {
          // No education program for this group
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [groupId]);

  const isLeader =
    myInfo?.role === "LEADER" || myInfo?.role === "SUB_LEADER";

  const monthOptions = Array.from(
    new Set(gatherings.map((g) => g.date.slice(0, 7)))
  ).sort((a, b) => b.localeCompare(a));

  const filtered = month
    ? gatherings.filter((g) => g.date.startsWith(month))
    : gatherings;

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/groups")}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          소그룹
        </button>

        {isLeader && (
          <button
            onClick={() => navigate(`/groups/${groupId}/manage`)}
            className="flex items-center gap-1 text-sm text-primary/70 transition-colors hover:text-primary"
          >
            <Settings className="h-4 w-4" />
            관리
          </button>
        )}
      </div>

      <section className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pt-1 pb-1">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex flex-shrink-0 flex-col items-center gap-1.5 pt-1"
          >
            <Avatar
              className={cn(
                "h-12 w-12 bg-primary/10",
                ROLE_RING[m.role ?? ""]
              )}
            >
              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                {m.name.slice(-2)}
              </AvatarFallback>
            </Avatar>
            {m.role && m.role !== "MEMBER" && (
              <Badge
                variant="outline"
                className={cn(
                  "h-4 rounded-full px-1.5 text-[10px]",
                  m.role === "LEADER" &&
                    "border-primary/60 text-primary"
                )}
              >
                {ROLE_LABELS[m.role] ?? m.role}
              </Badge>
            )}
          </div>
        ))}
      </section>

      {educationProgram && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold">
                {educationProgram.name}
                <span className="ml-1 font-normal text-muted-foreground">
                  ({members.filter((m) => m.role === "MEMBER").length}명)
                </span>
              </span>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              수료 {educationProgram.graduatedCount}명
            </Badge>
          </div>
          <div className="max-h-[280px] space-y-2 overflow-y-auto scrollbar-hide">
            {members.filter((m) => m.role === "MEMBER").length === 0 ? (
              <div className="rounded-lg bg-accent/40 px-3 py-3 text-center">
                <p className="text-xs text-muted-foreground/60">
                  새가족을 그룹에 추가하고 교육을 시작해보세요 💪
                </p>
              </div>
            ) : (
              members.filter((m) => m.role === "MEMBER")
                .sort((a, b) => {
                  const aCount = educationProgram.memberProgress.find((p) => p.groupMemberId === a.id)?.completedCount ?? 0;
                  const bCount = educationProgram.memberProgress.find((p) => p.groupMemberId === b.id)?.completedCount ?? 0;
                  return bCount - aCount;
                })
                .map((m) => {
                const memberProgress = educationProgram.memberProgress.find(
                  (p) => p.groupMemberId === m.id
                );
                const completed = memberProgress?.completedCount ?? 0;
                const total = educationProgram.totalWeeks;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                const completedWeeks = memberProgress?.completedWeeks ?? [];

                return (
                  <div key={m.id} className="rounded-lg bg-accent/40 px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 bg-primary/10">
                        <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
                          {m.name.slice(-2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{m.name}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: total }, (_, i) => i + 1).map((week) => (
                                <div
                                  key={week}
                                  className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded-[3px] text-[9px] font-semibold",
                                    completedWeeks.includes(week)
                                      ? "bg-amber-500 text-white"
                                      : "bg-muted-foreground/10 text-muted-foreground/40"
                                  )}
                                >
                                  {week}
                                </div>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {completed}/{total}주
                            {completed >= total && (
                              <CheckCircle2 className="ml-1 inline h-3.5 w-3.5 text-green-500" />
                            )}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-accent">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              completed >= total ? "bg-green-500" : "bg-primary"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      <section className="flex items-center justify-between">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-32 rounded-xl">
            <SelectValue placeholder="월 선택" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((m) => {
              const [, mm] = m.split("-");
              return (
                <SelectItem key={m} value={m}>
                  {parseInt(mm)}월
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">
          총 {filtered.length}회 모임
        </span>
      </section>

      <section className="space-y-3">
        {isLeader && (
          <Card
            className="cursor-pointer border-dashed border-primary/30 transition-colors hover:bg-primary/5"
            onClick={() => navigate(`/groups/${groupId}/create`)}
          >
            <CardContent className="flex items-center justify-center gap-2 py-3">
              <Plus className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                새 모임 만들기
              </span>
            </CardContent>
          </Card>
        )}

        {filtered.map((g) => {
          const date = new Date(g.date);
          const dayStr = `${date.getMonth() + 1}/${date.getDate()}`;
          const weekday = ["일", "월", "화", "수", "목", "금", "토"][
            date.getDay()
          ];

          return (
            <Card
              key={g.id}
              className="cursor-pointer border-0 shadow-md shadow-primary/5 transition-all hover:shadow-lg active:scale-[0.98]"
              onClick={() =>
                navigate(`/groups/${groupId}/gathering/${g.id}`)
              }
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-semibold">
                    {dayStr} ({weekday})
                  </span>
                </div>
                {g.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {g.description}
                  </p>
                )}
                <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    예배 {g.totalWorshipAttendanceCount}명 · 모임{" "}
                    {g.totalGatheringAttendanceCount}명
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {g.place}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              모임 기록이 없어요
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default GroupDetailPage;
