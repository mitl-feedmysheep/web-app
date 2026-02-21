import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError, authApi } from "@/lib/api";
import DaumPostcodeModal from "@/components/DaumPostcodeModal";
import useLocalStorage from "@/hooks/useLocalStorage";
import type { SignupRequest } from "@/types";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SIGNUP_KEYS = [
  "signup.name", "signup.birthDate", "signup.gender", "signup.phone",
  "signup.email", "signup.password", "signup.passwordConfirm",
  "signup.postcode", "signup.address1", "signup.address2",
  "signup.phoneChecked", "signup.phoneDuplicate",
  "signup.emailSendOk", "signup.verificationCode", "signup.emailVerifySuccess",
];

function clearSignupStorage() {
  SIGNUP_KEYS.forEach((k) => localStorage.removeItem(k));
}

function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useLocalStorage("signup.name", "");
  const [birthDate, setBirthDate] = useLocalStorage("signup.birthDate", "");
  const [gender, setGender] = useLocalStorage<"M" | "F" | "">("signup.gender", "");
  const [phone, setPhone] = useLocalStorage("signup.phone", "");
  const [email, setEmail] = useLocalStorage("signup.email", "");
  const [password, setPassword] = useLocalStorage("signup.password", "");
  const [passwordConfirm, setPasswordConfirm] = useLocalStorage("signup.passwordConfirm", "");
  const [postcode, setPostcode] = useLocalStorage("signup.postcode", "");
  const [address1, setAddress1] = useLocalStorage("signup.address1", "");
  const [address2, setAddress2] = useLocalStorage("signup.address2", "");

  const [isLoading, setIsLoading] = useState(false);
  const [showPostcode, setShowPostcode] = useState(false);

  // Phone check
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneChecked, setPhoneChecked] = useLocalStorage("signup.phoneChecked", false);
  const [phoneDuplicate, setPhoneDuplicate] = useLocalStorage("signup.phoneDuplicate", false);
  const [phoneError, setPhoneError] = useState(false);

  // Email verification
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false);
  const [emailSendOk, setEmailSendOk] = useLocalStorage("signup.emailSendOk", false);
  const [emailSendError, setEmailSendError] = useState(false);
  const [emailDupError, setEmailDupError] = useState("");
  const [emailVerifySuccess, setEmailVerifySuccess] = useLocalStorage("signup.emailVerifySuccess", false);
  const [verificationCode, setVerificationCode] = useLocalStorage("signup.verificationCode", "");
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState(false);

  const address2Ref = useRef<HTMLInputElement>(null);

  const canProceed = useMemo(() => {
    const birthDigits = birthDate.replace(/\D/g, "");
    const allFilled =
      name.trim() &&
      gender &&
      birthDigits.length === 8 &&
      phone.trim() &&
      email.trim() &&
      password.trim() &&
      passwordConfirm.trim() &&
      postcode.trim() &&
      address1.trim();

    return (
      Boolean(allFilled) &&
      emailRegex.test(email) &&
      password.length >= 8 &&
      password === passwordConfirm &&
      phoneChecked &&
      !phoneDuplicate &&
      emailVerifySuccess &&
      !emailSendError &&
      !phoneError
    );
  }, [
    name, gender, birthDate, phone, email, password, passwordConfirm,
    postcode, address1, phoneChecked, phoneDuplicate, phoneError,
    emailVerifySuccess, emailSendError,
  ]);

  const handleBirthDateChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = `${digits.slice(0, 4)}.${digits.slice(4)}`;
    if (digits.length > 6)
      formatted = `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
    setBirthDate(formatted);
  };

  const handlePhoneCheck = async () => {
    if (!phone.trim()) return;
    setPhoneLoading(true);
    setPhoneChecked(false);
    setPhoneDuplicate(false);
    setPhoneError(false);
    try {
      const available = await authApi.checkPhoneAvailability(phone);
      setPhoneDuplicate(!available);
      setPhoneChecked(true);
    } catch {
      setPhoneError(true);
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleEmailVerify = async () => {
    setEmailDupError("");
    setEmailSendError(false);
    setEmailSendOk(false);
    if (!emailRegex.test(email)) return;
    setEmailVerifyLoading(true);
    setEmailVerifySuccess(false);
    try {
      const available = await authApi.checkEmailAvailability(email);
      if (!available) {
        setEmailDupError("이미 등록된 이메일입니다.");
        return;
      }
      await authApi.sendEmailVerification(email);
      setEmailSendOk(true);
    } catch (error) {
      setEmailSendError(true);
      if (error instanceof ApiError && error.status === 409) {
        setEmailDupError("이미 등록된 이메일입니다.");
      }
    } finally {
      setEmailVerifyLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!verificationCode.trim()) return;
    setCodeLoading(true);
    setCodeError(false);
    try {
      await authApi.confirmEmailVerification(email, verificationCode.trim());
      setEmailVerifySuccess(true);
    } catch {
      setEmailVerifySuccess(false);
      setCodeError(true);
    } finally {
      setCodeLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed) return;
    setIsLoading(true);
    try {
      const birthDigits = birthDate.replace(/\D/g, "");
      const payload: SignupRequest = {
        password,
        name,
        email,
        birthdate: `${birthDigits.slice(0, 4)}-${birthDigits.slice(4, 6)}-${birthDigits.slice(6, 8)}`,
        sex: gender as "M" | "F",
        phone,
        address: `${postcode} ${address1} ${address2}`.trim(),
      };
      await authApi.signup(payload);
      clearSignupStorage();
      navigate("/login", { replace: true });
      setTimeout(() => toast.success("회원가입이 완료되었어요! 로그인해주세요."), 0);
    } catch {
      toast.error("회원가입에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-12 items-center border-b bg-background">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-2"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">회원가입</h1>
        <div className="w-11" />
      </header>

      <div className="flex-1 space-y-5 px-4 py-5 pb-28">
        {/* 이름 + 성별 */}
        <div className="space-y-1.5">
          <Label>이름</Label>
          <div className="flex items-center gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              className="flex-1"
              maxLength={30}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={gender === "M" ? "default" : "outline"}
                onClick={() => setGender("M")}
              >
                남
              </Button>
              <Button
                type="button"
                size="sm"
                variant={gender === "F" ? "default" : "outline"}
                onClick={() => setGender("F")}
              >
                여
              </Button>
            </div>
          </div>
        </div>

        {/* 생년월일 */}
        <div className="space-y-1.5">
          <Label>생년월일</Label>
          <Input
            value={birthDate}
            onChange={(e) => handleBirthDateChange(e.target.value)}
            inputMode="numeric"
            maxLength={10}
            placeholder="YYYY.MM.DD"
          />
        </div>

        {/* 전화번호 */}
        <div className="space-y-1.5">
          <Label>전화번호</Label>
          <div className="flex items-center gap-2">
            <Input
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/[^0-9]/g, ""));
                setPhoneChecked(false);
                setPhoneDuplicate(false);
              }}
              inputMode="tel"
              placeholder="01012345678"
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              variant={phoneChecked && !phoneDuplicate ? "default" : "outline"}
              onClick={handlePhoneCheck}
              disabled={phoneLoading || !phone.trim()}
            >
              {phoneLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "중복확인"
              )}
            </Button>
          </div>
          {phoneChecked && phoneDuplicate && (
            <p className="text-xs text-destructive">이미 등록된 전화번호입니다.</p>
          )}
          {phoneChecked && !phoneDuplicate && (
            <p className="text-xs text-green-600">사용할 수 있는 번호입니다.</p>
          )}
          {phoneError && (
            <p className="text-xs text-destructive">확인에 실패했어요. 다시 시도해주세요.</p>
          )}
        </div>

        {/* 이메일 */}
        <div className="space-y-1.5">
          <Label>이메일</Label>
          <div className="flex items-center gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailSendOk(false);
                setEmailSendError(false);
                setEmailVerifySuccess(false);
                setVerificationCode("");
                setCodeError(false);
                setEmailDupError("");
              }}
              placeholder="이메일 주소"
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              variant={
                emailSendOk || emailVerifySuccess ? "default" : "outline"
              }
              onClick={handleEmailVerify}
              disabled={!emailRegex.test(email) || emailVerifyLoading}
            >
              {emailVerifyLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "본인인증"
              )}
            </Button>
          </div>
          {emailDupError && (
            <p className="text-xs text-destructive">{emailDupError}</p>
          )}
          {emailSendOk && !emailDupError && (
            <p className="text-xs text-green-600">인증 코드가 발송되었어요.</p>
          )}
          {emailSendError && !emailSendOk && !emailDupError && (
            <p className="text-xs text-destructive">
              발송에 실패했어요. 다시 시도해주세요.
            </p>
          )}

          {emailSendOk && (
            <div className="mt-2 flex items-center gap-2">
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="인증 코드 입력"
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant={emailVerifySuccess ? "default" : "outline"}
                onClick={handleConfirmCode}
                disabled={!verificationCode.trim() || codeLoading}
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
        <div className="space-y-1.5">
          <Label>비밀번호</Label>
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

        {/* 비밀번호 확인 */}
        <div className="space-y-1.5">
          <Label>비밀번호 확인</Label>
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

        {/* 주소 */}
        <div className="space-y-1.5">
          <Label>주소</Label>
          <div className="flex items-center gap-2">
            <Input
              value={postcode}
              readOnly
              placeholder="우편번호"
              className="w-28 bg-muted"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowPostcode(true)}
            >
              우편번호 찾기
            </Button>
          </div>
          <Input
            value={address1}
            readOnly
            placeholder="주소"
            className="bg-muted"
          />
          <Input
            ref={address2Ref}
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
            placeholder="상세주소"
          />
        </div>
      </div>

      {/* Bottom fixed */}
      <div className="sticky bottom-0 space-y-2 border-t bg-background px-4 py-3">
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!canProceed || isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "가입 중..." : "가입하기"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="font-medium text-primary">
            로그인
          </Link>
        </p>
      </div>

      <DaumPostcodeModal
        open={showPostcode}
        onClose={() => setShowPostcode(false)}
        onSelect={({ zonecode, address }) => {
          setPostcode(zonecode);
          setAddress1(address);
          setShowPostcode(false);
          requestAnimationFrame(() => {
            address2Ref.current?.focus();
          });
        }}
      />
    </div>
  );
}

export default SignupPage;
