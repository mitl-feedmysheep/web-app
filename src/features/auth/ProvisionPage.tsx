import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ApiError, authApi, membersApi } from "@/lib/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ProvisionPage() {
  const navigate = useNavigate();

  // email
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [sending, setSending] = useState(false);
  const [emailSendOk, setEmailSendOk] = useState(false);

  // code
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [emailVerifySuccess, setEmailVerifySuccess] = useState(false);

  // password
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 상태 복원 (브라우저 밖 갔다 올 때)
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("provision.email");
      if (savedEmail) setEmail(savedEmail);
      const step = localStorage.getItem("provision.step");
      const verified = localStorage.getItem("provision.verified") === "true";
      if (step === "code" || verified) setEmailSendOk(true);
      if (verified) setEmailVerifySuccess(true);
    } catch {}
  }, []);

  // provisionToken 없으면 로그인으로
  useEffect(() => {
    if (!localStorage.getItem("provisionToken")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleSendVerification = async () => {
    setEmailError("");
    if (!emailRegex.test(email)) return;
    setSending(true);
    try {
      const available = await authApi.checkEmailAvailability(email);
      if (!available) {
        setEmailError("이미 등록된 이메일입니다.");
        return;
      }
      await authApi.sendEmailVerification(email);
      setEmailSendOk(true);
      toast.success("인증 코드가 발송되었어요.");
      try {
        localStorage.setItem("provision.email", email);
        localStorage.setItem("provision.step", "code");
      } catch {}
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setEmailError("이미 등록된 이메일입니다.");
      } else {
        setEmailError("인증 메일 발송에 실패했습니다.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!code.trim()) return;
    setCodeLoading(true);
    setCodeError(false);
    try {
      await authApi.confirmEmailVerification(email, code.trim());
      setEmailVerifySuccess(true);
      toast.success("인증에 성공했어요.");
      try {
        localStorage.setItem("provision.verified", "true");
        localStorage.setItem("provision.step", "confirmed");
      } catch {}
    } catch {
      setCodeError(true);
    } finally {
      setCodeLoading(false);
    }
  };

  const canSubmit =
    emailVerifySuccess &&
    password.length >= 8 &&
    password === passwordConfirm &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // 이메일 변경 + 비밀번호 변경 + is_provisioned = false
      const token = localStorage.getItem("provisionToken") || undefined;
      await membersApi.completeProvision(email, password, token);
      // 정리
      try {
        localStorage.removeItem("provisionToken");
        localStorage.removeItem("provisionPending");
        localStorage.removeItem("provision.email");
        localStorage.removeItem("provision.step");
        localStorage.removeItem("provision.verified");
      } catch {}
      authApi.logout();
      navigate("/login", { replace: true });
      setTimeout(
        () => toast.success("설정이 완료되었어요! 새 이메일로 로그인해주세요."),
        0
      );
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setEmailError("이미 등록된 이메일입니다.");
      } else {
        toast.error("오류가 발생했습니다. 다시 시도해주세요.");
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-12 items-center border-b bg-background">
        <div className="w-11" />
        <h1 className="flex-1 text-center text-lg font-semibold">
          시작하기
        </h1>
        <div className="w-11" />
      </header>

      <div className="flex-1 space-y-5 px-4 py-5 pb-28">
        <p className="text-sm font-medium text-green-600">
          사용하실 이메일과 비밀번호를 설정해주세요.
        </p>

        {/* 이메일 */}
        <div className="space-y-1.5">
          <Label>이메일</Label>
          <div className="flex items-center gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
                setEmailSendOk(false);
                setEmailVerifySuccess(false);
                setCode("");
                setCodeError(false);
              }}
              placeholder="이메일 주소"
              disabled={emailSendOk}
              className="flex-1 border-green-500 focus-visible:ring-green-500"
            />
            <Button
              type="button"
              size="sm"
              variant={emailSendOk ? "default" : "outline"}
              onClick={handleSendVerification}
              disabled={!emailRegex.test(email) || sending || emailSendOk}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "본인인증"
              )}
            </Button>
          </div>
          {emailError && (
            <p className="text-xs text-destructive">{emailError}</p>
          )}
          {emailSendOk && !emailError && (
            <p className="text-xs text-green-600">인증 코드가 발송되었어요.</p>
          )}

          {emailSendOk && (
            <div className="mt-2 flex items-center gap-2">
              <Input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setCodeError(false);
                }}
                placeholder="인증 코드 입력"
                disabled={emailVerifySuccess}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant={emailVerifySuccess ? "default" : "outline"}
                onClick={handleConfirmCode}
                disabled={!code.trim() || codeLoading || emailVerifySuccess}
              >
                {codeLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "확인"
                )}
              </Button>
            </div>
          )}
          {emailVerifySuccess && (
            <p className="text-xs text-green-600">인증에 성공했어요.</p>
          )}
          {codeError && !emailVerifySuccess && (
            <p className="text-xs text-destructive">
              인증에 실패했어요. 다시 시도해주세요.
            </p>
          )}
        </div>

        {/* 비밀번호 */}
        {emailVerifySuccess && (
          <>
            <div className="space-y-1.5">
              <Label>새 비밀번호</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상"
              />
              {password && password.length < 8 && (
                <p className="text-xs text-destructive">
                  비밀번호는 8자 이상이어야 합니다.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>새 비밀번호 확인</Label>
              <Input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 재입력"
              />
              {passwordConfirm && passwordConfirm !== password && (
                <p className="text-xs text-destructive">
                  비밀번호가 일치하지 않아요.
                </p>
              )}
            </div>

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? "설정 중..." : "완료"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProvisionPage;
