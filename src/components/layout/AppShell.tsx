import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import BottomNav from "./BottomNav";
import { Toaster } from "@/components/ui/sonner";
import { setGlobalNavigate, setGlobalToast } from "@/lib/auth-handler";

const MAIN_TABS = ["/", "/groups", "/prayers", "/my"];

function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setGlobalToast((msg) => toast.error(msg));
    setGlobalNavigate((path, replace) =>
      navigate(path, { replace: !!replace })
    );
  }, [navigate]);

  const showBottomNav = MAIN_TABS.includes(pathname);

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-background">
      <main className={showBottomNav ? "pb-20" : ""}>
        <Outlet />
      </main>
      {showBottomNav && <BottomNav />}
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default AppShell;
