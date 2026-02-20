import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { authApi, churchesApi, ApiError } from "@/lib/api";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = isEmailValid && password.length >= 8 && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await authApi.login({ email, password });

      if (res.isProvisioned) {
        navigate("/provision/email");
        return;
      }

      const churches = await churchesApi.getMyChurches();

      if (churches.length === 0) {
        setError("소속된 교회가 없습니다. 관리자에게 문의하세요.");
        return;
      }

      if (churches.length === 1) {
        localStorage.setItem("churchId", churches[0].id);
        navigate("/", { replace: true });
      } else {
        navigate("/select-church", { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="mb-10 text-center">
        <div className="mb-2 text-3xl">🕊️</div>
        <h1 className="text-2xl font-bold text-primary">IntoTheHeaven</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          우리의 기도를 기억합니다
        </p>
      </div>

      <Card className="w-full max-w-sm border-0 shadow-lg shadow-primary/5">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl"
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="h-12 w-full rounded-xl text-base font-semibold"
              disabled={!canSubmit}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <button
              onClick={() => navigate("/reset-password")}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              비밀번호 찾기
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="font-medium text-primary"
            >
              회원가입
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
