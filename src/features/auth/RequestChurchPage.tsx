import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Church as ChurchIcon,
  Loader2,
  ChevronRight,
  Mail,
  LogOut,
  Search,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { authApi, churchesApi, departmentsApi } from "@/lib/api";
import type { Church, Department } from "@/types";

const ADMIN_EMAIL = "kcs19542001@gmail.com";

type Step = "church" | "department";

function RequestChurchPage() {
  const navigate = useNavigate();
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Church | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [search, setSearch] = useState("");

  // Department selection
  const [step, setStep] = useState<Step>("church");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await churchesApi.getAllChurches();
        setChurches(data);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return churches;
    return churches.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q)
    );
  }, [churches, search]);

  const handleChurchSelect = async (church: Church) => {
    setSelected(church);
    setLoadingDepts(true);
    try {
      const result = await departmentsApi.getByChurch(church.id);
      const depts = Array.isArray(result) ? result : [];
      setDepartments(depts);
      if (depts.length === 0) {
        // 부서가 없으면 부서 없이 바로 확인 다이얼로그
        setSelectedDept(null);
        setConfirmOpen(true);
      } else {
        // 부서가 있으면 부서 선택 단계로
        setStep("department");
      }
    } catch {
      // 부서 조회 실패 시 부서 없이 진행
      setSelectedDept(null);
      setConfirmOpen(true);
    } finally {
      setLoadingDepts(false);
    }
  };

  const handleDeptSelect = (dept: Department) => {
    setSelectedDept(dept);
    setConfirmOpen(true);
  };

  const handleRequest = async () => {
    if (!selected) return;
    setRequesting(true);
    try {
      await churchesApi.requestRegistration(selected.id, selectedDept?.id);
      toast.success("등록 요청이 전송되었어요!");
      navigate("/pending-approval", { replace: true });
    } catch {
      toast.error("요청에 실패했어요. 다시 시도해주세요.");
    } finally {
      setRequesting(false);
    }
  };

  const handleBack = () => {
    setStep("church");
    setSelected(null);
    setSelectedDept(null);
    setDepartments([]);
  };

  const handleLogout = () => {
    authApi.logout();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col px-6 py-10">
      <div className="mb-6 text-center">
        <ChurchIcon className="mx-auto mb-3 h-10 w-10 text-primary" />
        <h1 className="text-xl font-bold">
          {step === "church" ? "교회 등록 요청" : "부서 선택"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "church"
            ? "소속될 교회를 선택하고 등록 요청을 보내주세요"
            : `${selected?.name}에서 소속할 부서를 선택해주세요`}
        </p>
      </div>

      <div className="mx-auto w-full max-w-sm">
        {step === "church" ? (
          <>
            {/* Search */}
            {churches.length > 0 && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="교회 이름 또는 지역으로 검색"
                  className="pl-9"
                />
              </div>
            )}

            {/* Church list */}
            {filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((church) => (
                  <Card
                    key={church.id}
                    className="cursor-pointer border-0 shadow-md shadow-primary/5 transition-all hover:shadow-lg active:scale-[0.98]"
                    onClick={() => handleChurchSelect(church)}
                  >
                    <CardContent className="flex items-center gap-3 py-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <ChurchIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{church.name}</h3>
                        {church.location && (
                          <p className="text-xs text-muted-foreground">
                            {church.location}
                          </p>
                        )}
                      </div>
                      {loadingDepts && selected?.id === church.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : search.trim() ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                검색 결과가 없습니다.
              </p>
            ) : null}

            {/* Contact admin */}
            <div className="mt-6 flex flex-col items-center gap-1.5 border-t pt-6 text-center">
              <p className="text-sm text-muted-foreground">
                찾으시는 교회가 없나요? 관리자에게 문의해주세요.
              </p>
              <a
                href={`mailto:${ADMIN_EMAIL}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                {ADMIN_EMAIL}
              </a>
            </div>
          </>
        ) : (
          <>
            {/* Back button */}
            <button
              onClick={handleBack}
              className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              교회 다시 선택
            </button>

            {/* Department list */}
            <div className="space-y-3">
              {departments.map((dept) => (
                <Card
                  key={dept.id}
                  className="cursor-pointer border-0 shadow-md shadow-primary/5 transition-all hover:shadow-lg active:scale-[0.98]"
                  onClick={() => handleDeptSelect(dept)}
                >
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{dept.name}</h3>
                      {dept.description && (
                        <p className="text-xs text-muted-foreground">
                          {dept.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mx-auto mt-8 w-full max-w-sm">
        <Button
          variant="ghost"
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </Button>
      </div>

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={(open) => {
        if (!open) {
          setConfirmOpen(false);
          setSelectedDept(null);
        }
      }}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="sr-only">등록 요청 확인</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-foreground">
                {selected?.name}
              </span>
              {selectedDept && (
                <>
                  {" "}
                  <span className="font-medium text-foreground">
                    {selectedDept.name}
                  </span>
                </>
              )}
              에 등록 요청을 보낼까요?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setConfirmOpen(false);
                setSelectedDept(null);
              }}
              disabled={requesting}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={handleRequest}
              disabled={requesting}
            >
              {requesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              요청하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RequestChurchPage;
