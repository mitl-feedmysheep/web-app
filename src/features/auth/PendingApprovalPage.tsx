import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";
import { authApi } from "@/lib/api";

function PendingApprovalPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authApi.logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-8 w-8 text-primary" />
        </div>

        <h1 className="text-xl font-bold">승인 대기 중</h1>

        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          교회 등록 요청이 전송되었어요.
          <br />
          관리자가 요청을 확인한 후 승인해드릴게요.
          <br />
          승인 완료 후 다시 로그인해주세요.
        </p>
      </div>

      <div className="mt-10 w-full max-w-xs">
        <Button
          variant="ghost"
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </div>
  );
}

export default PendingApprovalPage;
