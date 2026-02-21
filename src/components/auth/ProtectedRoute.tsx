import { Navigate, Outlet } from "react-router-dom";
import { authApi } from "@/lib/api";

function ProtectedRoute() {
  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
