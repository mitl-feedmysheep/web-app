import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import BottomNav from "./BottomNav";
import { Toaster } from "@/components/ui/sonner";
import { setGlobalNavigate, setGlobalToast } from "@/lib/auth-handler";
import { NotificationPromptSheet } from "@/components/NotificationPromptSheet";
import { isSupported, getPermission } from "@/lib/push";

const MAIN_TABS = ["/", "/groups", "/prayers", "/sermon-notes", "/my"];
const NOTIFICATION_PROMPTED_KEY = "notification.prompted";

function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    setGlobalToast((msg) => toast.error(msg));
    setGlobalNavigate((path, replace) =>
      navigate(path, { replace: !!replace })
    );
  }, [navigate]);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (
      authToken &&
      isSupported() &&
      getPermission() === "default" &&
      !localStorage.getItem(NOTIFICATION_PROMPTED_KEY)
    ) {
      const timer = setTimeout(() => setShowNotificationPrompt(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNotificationPromptClose = () => {
    localStorage.setItem(NOTIFICATION_PROMPTED_KEY, "1");
    setShowNotificationPrompt(false);
  };

  const showBottomNav = MAIN_TABS.includes(pathname);

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-background">
      <main className={showBottomNav ? "pb-20" : ""}>
        <Outlet />
      </main>
      {showBottomNav && <BottomNav />}
      <Toaster position="top-center" richColors duration={2000} />
      <NotificationPromptSheet
        open={showNotificationPrompt}
        onClose={handleNotificationPromptClose}
      />
    </div>
  );
}

export default AppShell;
