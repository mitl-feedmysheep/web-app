import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError, authApi, membersApi } from "@/lib/api";

function ChangePasswordPage() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [currentError, setCurrentError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!confirmPassword && !newPassword) {
      setError("");
      return;
    }
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
    } else if (newPassword && newPassword.length < 8) {
      setError("새 비밀번호는 8자 이상이어야 합니다.");
    } else {
      setError("");
    }
  }, [newPassword, confirmPassword]);

  const handleSubmit = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setError("");
    setCurrentError("");

    try {
      setLoading(true);
      await membersApi.changePassword(currentPassword, newPassword);
      authApi.logout();
      navigate("/login", { replace: true });
      setTimeout(() => {
        toast.success("비밀번호가 변경되었어요. 다시 로그인해주세요.");
      }, 0);
    } catch (e) {
      if (e instanceof ApiError && e.status === 400) {
        setCurrentError("현재 비밀번호가 올바르지 않아요.");
      } else {
        setError("비밀번호 변경에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading || !!error || !currentPassword || !newPassword || !confirmPassword;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-12 items-center bg-background">
        <button onClick={() => navigate(-1)} className="px-3 py-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">
          비밀번호 변경
        </h1>
        <div className="w-11" />
      </header>

      <div className="flex-1 space-y-5 px-4 py-4">
        {/* 현재 비밀번호 */}
        <div className="space-y-1.5">
          <Label>현재 비밀번호</Label>
          <div className="relative">
            <Input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (currentError) setCurrentError("");
              }}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
            >
              {showCurrent ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {currentError && (
            <p className="text-xs text-destructive">{currentError}</p>
          )}
        </div>

        {/* 새 비밀번호 */}
        <div className="space-y-1.5">
          <Label>새 비밀번호</Label>
          <div className="relative">
            <Input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
            >
              {showNew ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* 새 비밀번호 확인 */}
        <div className="space-y-1.5">
          <Label>새 비밀번호 확인</Label>
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isDisabled}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "변경 중..." : "변경하기"}
        </Button>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
