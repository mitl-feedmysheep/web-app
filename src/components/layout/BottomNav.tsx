import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Heart, BookOpen, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { notificationsApi } from "@/lib/api";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "홈" },
  { path: "/groups", icon: Users, label: "소그룹" },
  { path: "/notifications", icon: Bell, label: "알림" },
  { path: "/prayers", icon: Heart, label: "기도" },
  { path: "/my", icon: User, label: "MY" },
] as const;

function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchUnread() {
      try {
        const data = await notificationsApi.getUnreadCount();
        if (mounted && data) setUnreadCount(data.count);
      } catch {
        // silently fail
      }
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive =
            path === "/"
              ? pathname === "/"
              : pathname.startsWith(path);

          const showBadge = path === "/notifications" && unreadCount > 0;

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn("h-5 w-5", isActive && "fill-primary/20")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {showBadge && (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
