import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  UserPen,
  KeyRound,
  Church,
  ChevronRight,
  LogOut,
  Loader2,
} from "lucide-react";
import { authApi, membersApi } from "@/lib/api";
import type { User } from "@/types";

const MENU_ITEMS = [
  { icon: UserPen, label: "내 정보 수정", path: "/my/account" },
  { icon: KeyRound, label: "비밀번호 변경", path: "/my/password" },
  { icon: Church, label: "교회 전환", path: "/select-church" },
] as const;

function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await membersApi.getMyInfo();
        setUser(me);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    authApi.logout();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6">
      <section className="flex items-center gap-4">
        <Avatar className="h-16 w-16 bg-primary/10">
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
            {user?.name?.slice(-2) ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-bold">{user?.name ?? ""}</h2>
          <p className="text-sm text-muted-foreground">
            {user?.email ?? ""}
          </p>
        </div>
      </section>

      <Card className="border-0 shadow-md shadow-primary/5">
        <CardContent className="p-0">
          {MENU_ITEMS.map(({ icon: Icon, label, path }, index) => (
            <div key={path}>
              <button
                onClick={() => navigate(path)}
                className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent"
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1 text-left text-sm font-medium">
                  {label}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              {index < MENU_ITEMS.length - 1 && (
                <Separator className="mx-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        variant="ghost"
        className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        로그아웃
      </Button>
    </div>
  );
}

export default MyPage;
