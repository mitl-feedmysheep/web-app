import { useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "홈" },
  { path: "/groups", icon: Users, label: "소그룹" },
  { path: "/prayers", icon: Heart, label: "기도" },
  { path: "/my", icon: User, label: "MY" },
] as const;

function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const isActive =
            path === "/"
              ? pathname === "/"
              : pathname.startsWith(path);

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn("h-5 w-5", isActive && "fill-primary/20")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[11px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
