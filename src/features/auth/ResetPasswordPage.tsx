import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError, authApi, membersApi } from "@/lib/api";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [step1Error, setStep1Error] = useState("");
  const [step1Loading, setStep1Loading] = useState(false);

  // Step 2
  const [verificationCode, setVerificationCode] = useState("");
  const [step2Error, setStep2Error] = useState("");
  const [step2Loading, setStep2Loading] = useState(false);

  // Step 3
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [step3Loading, setStep3Loading] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("이메일 형식이 올바르지 않아요.");
    } else {
      setEmailError("");
    }
  };

  // Step 1: verify member + send code
  const handleSendCode = async () => {
    if (!isEmailValid || !name.trim()) {
      if (!name.trim()) setStep1Error("이름을 입력해주세요.");
      return;
    }
    setStep1Loading(true);
    setStep1Error("");
    try {
      await membersApi.verifyMember(email, name);
      await authApi.sendPasswordResetCode(email);
      setStep(2);
      toast.success("인증 코드가 발송되었어요.");
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
        setStep1Error("이메일과 이름을 다시 확인해주세요.");
      } else {
        setStep1Error("오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setStep1Loading(false);
    }
  };

  // Step 2: verify code
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setStep2Error("인증 코드를 입력해주세요.");
      return;
    }
    setStep2Loading(true);
    setStep2Error("");
    try {
      await authApi.confirmPasswordResetCode(email, verificationCode);
      toast.success("인증 완료! 새 비밀번호를 설정해주세요.");
      setStep(3);
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        setStep2Error("인증 코드가 올바르지 않습니다.");
      } else {
        setStep2Error("오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setStep2Loading(false);
    }
  };

  // Step 3: real-time validation
  useEffect(() => {
    if (!confirmPassword && !newPassword) {
      setPasswordError("");
      return;
    }
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else if (newPassword && newPassword.length < 8) {
      setPasswordError("새 비밀번호는 8자 이상이어야 합니다.");
    } else {
      setPasswordError("");
    }
  }, [newPassword, confirmPassword]);

  // Step 3: reset password
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setPasswordError("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setStep3Loading(true);
    setPasswordError("");
    try {
      await authApi.resetPassword(email, newPassword);
      navigate("/login", { replace: true });
      setTimeout(() => toast.success("비밀번호가 변경되었어요. 로그인해주세요."), 0);
    } catch {
      setPasswordError("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setStep3Loading(false);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate("/login");
    } else {
      setStep((prev) => (prev - 1) as 1 | 2);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-12 items-center bg-background">
        <button onClick={handleBack} className="px-3 py-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">
          비밀번호 찾기
        </h1>
        <div className="w-11" />
      </header>

      {/* Step 1 */}
      {step === 1 && (
        <div className="flex-1 space-y-5 px-4 py-5">
          <p className="text-sm text-muted-foreground">
            가입하신 이메일 주소와 이름을 입력해주세요.
          </p>

          <div className="space-y-1.5">
            <Label>이메일</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="이메일 주소"
            />
            {emailError && (
              <p className="text-xs text-destructive">{emailError}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>이름</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
            />
          </div>

          {step1Error && (
            <p className="text-sm text-destructive">{step1Error}</p>
          )}

          <Button
            className="w-full"
            onClick={handleSendCode}
            disabled={step1Loading || !email.trim() || !name.trim() || !!emailError}
          >
            {step1Loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step1Loading ? "전송 중..." : "인증 코드 전송"}
          </Button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="flex-1 space-y-5 px-4 py-5">
          <p className="text-sm text-muted-foreground">
            이메일로 발송된 인증 코드를 입력해주세요.
          </p>

          <div className="space-y-1.5">
            <Label>인증 코드</Label>
            <Input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="인증 코드 입력"
              maxLength={10}
            />
          </div>

          {step2Error && (
            <p className="text-sm text-destructive">{step2Error}</p>
          )}

          <Button
            className="w-full"
            onClick={handleVerifyCode}
            disabled={step2Loading || !verificationCode.trim()}
          >
            {step2Loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {step2Loading ? "확인 중..." : "확인"}
          </Button>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="flex-1 space-y-5 px-4 py-5">
          <p className="text-sm text-muted-foreground">
            새로운 비밀번호를 설정해주세요.
          </p>

          <div className="space-y-1.5">
            <Label>새 비밀번호</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8자 이상"
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

          <div className="space-y-1.5">
            <Label>새 비밀번호 확인</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 재입력"
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

          {passwordError && (
            <p className="text-sm text-destructive">{passwordError}</p>
          )}

          <Button
            className="w-full"
            onClick={handleResetPassword}
            disabled={
              step3Loading ||
              !!passwordError ||
              !newPassword ||
              !confirmPassword ||
              newPassword.length < 8 ||
              newPassword !== confirmPassword
            }
          >
            {step3Loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {step3Loading ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ResetPasswordPage;
