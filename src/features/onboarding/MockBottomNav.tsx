import { Home, Users, Heart, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_NAV_ITEMS = [
  { path: "/", icon: Home, label: "홈" },
  { path: "/groups", icon: Users, label: "" }, // label은 groupLabel prop으로 대체
  { path: "/prayers", icon: Heart, label: "기도" },
  { path: "/sermon-notes", icon: BookOpen, label: "설교노트" },
  { path: "/my", icon: User, label: "MY" },
] as const;

interface MockBottomNavProps {
  activeTab: "/" | "/groups" | "/prayers" | "/sermon-notes" | "/my";
  groupLabel?: string;
}

function MockBottomNav({ activeTab, groupLabel = "소그룹" }: MockBottomNavProps) {
  return (
    <nav className="border-t border-border/40 bg-background/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-around px-2">
        {BASE_NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const displayLabel = path === "/groups" ? groupLabel : label;
          const isActive = path === activeTab;
          return (
            <div
              key={path}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon
                className={cn("h-5 w-5", isActive && "fill-primary/20")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[11px] font-medium">{displayLabel}</span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export default MockBottomNav;
export { BASE_NAV_ITEMS };
export type { MockBottomNavProps };
