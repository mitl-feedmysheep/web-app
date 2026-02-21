import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError, membersApi } from "@/lib/api";
import type { User } from "@/types";

function AccountPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [sex, setSex] = useState<"M" | "F" | "">("");
  const [birthDateInput, setBirthDateInput] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchMe = async () => {
      try {
        const me = await membersApi.getMyInfo();
        if (!mounted) return;
        setUser(me);
        setName(me.name || "");
        setSex(me.sex === "M" || me.sex === "F" ? me.sex : "");
        try {
          const date = new Date(me.birthday);
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, "0");
          const d = String(date.getDate()).padStart(2, "0");
          setBirthDateInput(`${y}.${m}.${d}`);
        } catch {
          const digits = (me.birthday || "").replace(/\D/g, "").slice(0, 8);
          let formatted = digits;
          if (digits.length > 4)
            formatted = `${digits.slice(0, 4)}.${digits.slice(4)}`;
          if (digits.length > 6)
            formatted = `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
          setBirthDateInput(formatted);
        }
        setPhone(me.phone || "");
      } catch {
        toast.error("정보를 불러오지 못했어요");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchMe();
    return () => {
      mounted = false;
    };
  }, []);

  const formatBirthday = (dateString?: string): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}.${m}.${d}`;
    } catch {
      return dateString;
    }
  };

  const handleBirthDateChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;
    if (digits.length > 4)
      formatted = `${digits.slice(0, 4)}.${digits.slice(4)}`;
    if (digits.length > 6)
      formatted = `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
    setBirthDateInput(formatted);
  };

  const handleSave = async () => {
    if (!user) return;

    const birthDigits = birthDateInput.replace(/\D/g, "");
    if (birthDigits.length !== 8) {
      toast.error("생년월일 8자리를 입력해주세요");
      return;
    }
    if (!name.trim()) {
      toast.error("이름을 입력해주세요");
      return;
    }
    if (sex !== "M" && sex !== "F") {
      toast.error("성별을 선택해주세요");
      return;
    }
    if (!/^\d{7,}$/.test(phone.replace(/\D/g, ""))) {
      toast.error("전화번호를 올바르게 입력해주세요");
      return;
    }

    const birthday = `${birthDigits.slice(0, 4)}-${birthDigits.slice(4, 6)}-${birthDigits.slice(6, 8)}`;

    try {
      setSaving(true);
      const updated = await membersApi.updateMyInfo({
        id: user.id,
        name: name.trim(),
        sex,
        birthday,
        phone: phone.replace(/\D/g, ""),
      });
      setUser(updated);
      setIsEditing(false);
      toast.success("내 정보가 변경되었어요");
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error("저장에 실패했어요");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-12 items-center bg-background">
        <button onClick={() => navigate(-1)} className="px-3 py-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">내 정보</h1>
        <div className="w-11" />
      </header>

      <div className="flex-1 space-y-3 px-4 py-4 pb-24">
        {/* 이름 */}
        <div className="space-y-1.5">
          <Label>이름</Label>
          {isEditing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
            />
          ) : (
            <p className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
              {user?.name || "-"}
            </p>
          )}
        </div>

        {/* 이메일 (읽기 전용) */}
        <div className="space-y-1.5">
          <Label>이메일</Label>
          <p className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
            {user?.email || "-"}
          </p>
        </div>

        {/* 성별 */}
        <div className="space-y-1.5">
          <Label>성별</Label>
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={sex === "M" ? "default" : "outline"}
                onClick={() => setSex("M")}
              >
                남
              </Button>
              <Button
                type="button"
                size="sm"
                variant={sex === "F" ? "default" : "outline"}
                onClick={() => setSex("F")}
              >
                여
              </Button>
            </div>
          ) : (
            <p className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
              {user?.sex === "M" ? "남" : user?.sex === "F" ? "여" : "-"}
            </p>
          )}
        </div>

        {/* 생년월일 */}
        <div className="space-y-1.5">
          <Label>생년월일</Label>
          {isEditing ? (
            <Input
              value={birthDateInput}
              onChange={(e) => handleBirthDateChange(e.target.value)}
              inputMode="numeric"
              maxLength={10}
              placeholder="YYYY.MM.DD"
            />
          ) : (
            <p className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
              {formatBirthday(user?.birthday)}
            </p>
          )}
        </div>

        {/* 전화번호 */}
        <div className="space-y-1.5">
          <Label>전화번호</Label>
          {isEditing ? (
            <Input
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/[^0-9]/g, ""))
              }
              inputMode="numeric"
              placeholder="숫자만 입력"
            />
          ) : (
            <p className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
              {user?.phone || "-"}
            </p>
          )}
        </div>
      </div>

      {/* Bottom fixed button */}
      <div className="sticky bottom-0 border-t bg-background px-4 py-3">
        <Button
          className="w-full"
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={saving}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "저장하기" : "변경하기"}
        </Button>
      </div>
    </div>
  );
}

export default AccountPage;
