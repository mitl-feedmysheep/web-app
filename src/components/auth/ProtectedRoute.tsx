import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authApi, departmentsApi } from "@/lib/api";

function ProtectedRoute() {
  const [ready, setReady] = useState(false);
  const [redirectToDept, setRedirectToDept] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    async function ensureDepartment() {
      const churchId = localStorage.getItem("churchId");
      const departmentId = localStorage.getItem("departmentId");

      if (churchId && !departmentId) {
        try {
          const depts = await departmentsApi.getMyDepartments(churchId);
          if (depts.length === 1) {
            localStorage.setItem("departmentId", depts[0].departmentId);
            localStorage.setItem(
              "departmentName",
              depts[0].departmentName ?? ""
            );
          } else if (depts.length > 1 && pathname !== "/my/department") {
            setRedirectToDept(true);
          }
        } catch {
          // 부서 조회 실패해도 앱 진입은 허용
        }
      }
      setReady(true);
    }

    if (!authApi.isAuthenticated()) {
      setReady(true);
      return;
    }

    ensureDepartment();
  }, [pathname]);

  if (!ready) return null;

  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (redirectToDept) {
    return <Navigate to="/my/department" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
