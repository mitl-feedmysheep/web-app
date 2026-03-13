import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { departmentsApi } from "@/lib/api";
import type { DepartmentMember } from "@/types";

function SelectDepartmentPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DepartmentMember[]>([]);
  const [loading, setLoading] = useState(true);
  const currentDeptId = localStorage.getItem("departmentId");

  useEffect(() => {
    const load = async () => {
      try {
        const churchId = localStorage.getItem("churchId");
        if (!churchId) {
          navigate("/select-church", { replace: true });
          return;
        }
        const data = await departmentsApi.getMyDepartments(churchId);
        const depts = Array.isArray(data) ? data : [];
        setDepartments(depts);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleSelect = (dept: DepartmentMember) => {
    localStorage.setItem("departmentId", dept.departmentId);
    localStorage.setItem("departmentName", dept.departmentName ?? "");
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (departments.length <= 1) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <Building2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-bold">소속 부서가 하나뿐이에요</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          다른 부서에 배정되면 여기서 전환할 수 있어요
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <Building2 className="mx-auto mb-3 h-10 w-10 text-primary" />
        <h1 className="text-xl font-bold">부서를 선택해주세요</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          여러 부서에 소속되어 있어요
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {departments.map((dept) => {
          const isActive = dept.departmentId === currentDeptId;
          return (
            <Card
              key={dept.id}
              className={`cursor-pointer border-0 shadow-md shadow-primary/5 transition-all hover:shadow-lg active:scale-[0.98] ${
                isActive ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleSelect(dept)}
            >
              <CardContent className="flex items-center gap-3 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{dept.departmentName}</h3>
                  <p className="text-xs text-muted-foreground capitalize">
                    {dept.role.toLowerCase()}
                  </p>
                </div>
                {isActive ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default SelectDepartmentPage;
