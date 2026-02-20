import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Cake, Heart, Megaphone, Loader2 } from "lucide-react";
import { membersApi, groupsApi, churchesApi } from "@/lib/api";
import type { User } from "@/types";

function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [birthdays, setBirthdays] = useState<User[]>([]);
  const [prayerCount, setPrayerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    const load = async () => {
      try {
        const churchId = localStorage.getItem("churchId");
        if (!churchId) return;

        const [me, groups] = await Promise.all([
          membersApi.getMyInfo(),
          groupsApi.getGroupsByChurch(churchId),
        ]);

        setUser(me);

        const allMembers: User[] = [];
        await Promise.all(
          groups.map(async (g) => {
            const members = await groupsApi.getGroupMembers(g.id);
            allMembers.push(...members);
          })
        );

        const uniqueMembers = Array.from(
          new Map(allMembers.map((m) => [m.id, m])).values()
        );

        const monthStr = String(currentMonth).padStart(2, "0");
        setBirthdays(
          uniqueMembers.filter((m) => m.birthday?.slice(5, 7) === monthStr)
        );

        try {
          const { count } = await churchesApi.getPrayerRequestCount(churchId);
          setPrayerCount(count);
        } catch {
          setPrayerCount(0);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentMonth]);

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 py-6">
      <section>
        <h2 className="text-xl font-bold">
          {user?.name ?? "사용자"}님, 반가워요! 👋
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          오늘도 하나님의 은혜 안에서 좋은 하루 되세요
        </p>
      </section>

      <section>
        <Card className="border-0 bg-primary/5 shadow-none">
          <CardContent className="flex items-center gap-4 py-4">
            <Heart className="h-6 w-6 shrink-0 fill-primary/20 text-primary" />
            <div>
              <span className="text-2xl font-bold text-primary">
                {prayerCount.toLocaleString()}
              </span>
              <p className="text-xs text-muted-foreground">
                우리 교회에 쌓인 기도제목
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">공지사항</h3>
        </div>
        <p className="py-4 text-center text-sm text-muted-foreground">
          공지사항이 없습니다.
        </p>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2">
          <Cake className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{currentMonth}월 생일자</h3>
        </div>

        {birthdays.length > 0 ? (
          <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {birthdays.map((person) => (
              <Card
                key={person.id}
                className="flex-shrink-0 border-0 bg-accent/50 shadow-none"
              >
                <CardContent className="flex items-center gap-2.5 px-3 py-2.5">
                  <Avatar className="h-8 w-8 bg-primary/10">
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {person.name.slice(-2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{person.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {person.birthday?.slice(5)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            이번 달 생일자가 없어요 🎂
          </p>
        )}
      </section>
    </div>
  );
}

export default HomePage;
