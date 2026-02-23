import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cake, Megaphone, Loader2, MessageSquareHeart, Mail } from "lucide-react";
import { membersApi, churchesApi, messagesApi } from "@/lib/api";
import type { User } from "@/types";
import SendMessageModal from "./SendMessageModal";
import MiniCalendar from "./MiniCalendar";

interface BirthdayMember {
  memberId: string;
  name: string;
  birthday: string;
  sex: "M" | "F" | null;
}

function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [birthdays, setBirthdays] = useState<BirthdayMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageTarget, setMessageTarget] = useState<{ id: string; name: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const currentMonth = new Date().getMonth() + 1;

  const fetchUnread = useCallback(async () => {
    try {
      const { count } = await messagesApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const churchId = localStorage.getItem("churchId");
      if (!churchId) {
        setLoading(false);
        return;
      }

      try {
        const me = await membersApi.getMyInfo();
        setUser(me);
      } catch {
        // ignore
      }

      try {
        const birthdayMembers = await churchesApi.getBirthdayMembers(churchId, currentMonth);
        setBirthdays(birthdayMembers);
      } catch {
        setBirthdays([]);
      }

      setLoading(false);
    };
    load();
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [currentMonth, fetchUnread]);

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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {user?.name ?? "사용자"}님, 반가워요! 👋
          </h2>
          <button
            type="button"
            className="relative shrink-0 p-1.5 text-primary/70 hover:text-primary transition-colors"
            onClick={() => navigate("/messages")}
          >
            <Mail className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          오늘도 하나님의 은혜 안에서 좋은 하루 되세요
        </p>
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
        <div className="mb-2 flex items-baseline justify-between">
          <div className="flex items-center gap-2">
            <Cake className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{currentMonth}월 생일자 ({birthdays.length}명)</h3>
          </div>
          {birthdays.length > 0 && (
            <span className="flex items-center gap-0.5 pr-1 text-[11px] text-muted-foreground">
              아래의 <MessageSquareHeart className="inline h-3 w-3 text-pink-400" />을 눌러 생일을 축하해주세요!
            </span>
          )}
        </div>

        {birthdays.length > 0 ? (
          <div className="max-h-[230px] space-y-2 overflow-y-auto pr-1">
            {(() => {
              const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
              const today = new Date();
              const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

              const withDDay = birthdays.map((person) => {
                if (!person.birthday) return { ...person, dDay: null, bdDate: null };
                const [, m, d] = person.birthday.split("-").map(Number);
                const bd = new Date(today.getFullYear(), m - 1, d);
                const diff = Math.ceil((bd.getTime() - todayStart.getTime()) / 86400000);
                return { ...person, dDay: diff, bdDate: bd };
              });

              const sorted = withDDay.sort((a, b) => {
                const rank = (d: number | null) => {
                  if (d === 0) return 0;
                  if (d !== null && d > 0) return 1;
                  return 2;
                };
                const ra = rank(a.dDay);
                const rb = rank(b.dDay);
                if (ra !== rb) return ra - rb;
                if (a.dDay === null || b.dDay === null) return 0;
                if (ra === 1) return a.dDay - b.dDay;
                if (ra === 2) return Math.abs(a.dDay) - Math.abs(b.dDay);
                return 0;
              });

              return sorted.map((person) => {
                const dateLabel = person.bdDate
                  ? `${person.bdDate.getMonth() + 1}월 ${person.bdDate.getDate()}일(${DAYS[person.bdDate.getDay()]})`
                  : "";

                const dDayLabel = (() => {
                  if (person.dDay === null) return null;
                  if (person.dDay === 0) return "🎂 TODAY";
                  if (person.dDay > 0) return `D-${person.dDay}`;
                  return `D+${Math.abs(person.dDay)}`;
                })();

                return (
                  <div
                    key={person.memberId}
                    className="flex items-center gap-2.5 rounded-lg bg-accent/50 px-3 py-2.5"
                  >
                    {person.sex && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          person.sex === "M"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-pink-100 text-pink-600"
                        }`}
                      >
                        {person.sex === "M" ? "남" : "여"}
                      </span>
                    )}
                    <span className="text-sm font-medium">{person.name}</span>
                    <span className="text-xs text-muted-foreground">{dateLabel}</span>
                    {dDayLabel && (
                      <span
                        className={`ml-auto shrink-0 text-xs font-semibold ${
                          person.dDay === 0 ? "text-red-500" : "text-primary/70"
                        }`}
                      >
                        {dDayLabel}
                      </span>
                    )}
                    {(() => {
                      const isSelf = user && person.memberId === user.id;
                      return (
                        <button
                          type="button"
                          disabled={!!isSelf}
                          className={`shrink-0 transition-colors ${
                            isSelf
                              ? "cursor-not-allowed text-gray-300"
                              : "text-pink-400 hover:text-pink-600"
                          }`}
                          onClick={() => !isSelf && setMessageTarget({ id: person.memberId, name: person.name })}
                        >
                          <MessageSquareHeart className="h-4 w-4" />
                        </button>
                      );
                    })()}
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            이번 달 생일자가 없어요 🎂
          </p>
        )}
      </section>

      <MiniCalendar />

      <SendMessageModal
        open={!!messageTarget}
        onClose={() => setMessageTarget(null)}
        receiverId={messageTarget?.id ?? ""}
        receiverName={messageTarget?.name ?? ""}
      />
    </div>
  );
}

export default HomePage;
