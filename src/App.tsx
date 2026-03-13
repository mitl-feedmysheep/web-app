import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SplashScreen from "@/features/auth/SplashScreen";
import LoginPage from "@/features/auth/LoginPage";
import SelectChurchPage from "@/features/auth/SelectChurchPage";
import SignupPage from "@/features/auth/SignupPage";
import ResetPasswordPage from "@/features/auth/ResetPasswordPage";
import RequestChurchPage from "@/features/auth/RequestChurchPage";
import PendingApprovalPage from "@/features/auth/PendingApprovalPage";
import ProvisionPage from "@/features/auth/ProvisionPage";
import HomePage from "@/features/home/HomePage";
import GroupListPage from "@/features/group/GroupListPage";
import GroupDetailPage from "@/features/group/GroupDetailPage";
import GatheringDetailPage from "@/features/gathering/GatheringDetailPage";
import CreateGatheringPage from "@/features/gathering/CreateGatheringPage";
import PrayerPage from "@/features/prayer/PrayerPage";
import MyPage from "@/features/my/MyPage";
import AccountPage from "@/features/my/AccountPage";
import ChangePasswordPage from "@/features/my/ChangePasswordPage";
import SelectDepartmentPage from "@/features/my/SelectDepartmentPage";
import MessagesPage from "@/features/messages/MessagesPage";
import NotificationsPage from "@/features/notifications/NotificationsPage";
import GroupManagePage from "@/features/group/GroupManagePage";
import SermonNotesPage from "@/features/sermon-notes/SermonNotesPage";
import CreateSermonNotePage from "@/features/sermon-notes/CreateSermonNotePage";
import SermonNoteDetailPage from "@/features/sermon-notes/SermonNoteDetailPage";

function isSplashEnabled(): boolean {
  const raw = String(import.meta.env.VITE_IS_SPLASH_ON ?? "true").toLowerCase();
  if (!["true", "1", "yes", "on"].includes(raw)) return false;
  return localStorage.getItem("splash.seen") !== "true";
}

function App() {
  const [showSplash, setShowSplash] = useState(isSplashEnabled);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    try { localStorage.setItem("splash.seen", "true"); } catch {}
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          {/* Public - Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/select-church" element={<SelectChurchPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/request-church" element={<RequestChurchPage />} />
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="/provision/email" element={<ProvisionPage />} />

          {/* Protected - requires auth token */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/groups" element={<GroupListPage />} />
            <Route path="/prayers" element={<PrayerPage />} />
            <Route path="/sermon-notes" element={<SermonNotesPage />} />
            <Route path="/sermon-notes/create" element={<CreateSermonNotePage />} />
            <Route path="/sermon-notes/:id" element={<SermonNoteDetailPage />} />
            <Route path="/sermon-notes/:id/edit" element={<CreateSermonNotePage />} />
            <Route path="/my" element={<MyPage />} />
            <Route path="/my/account" element={<AccountPage />} />
            <Route path="/my/password" element={<ChangePasswordPage />} />
            <Route path="/my/department" element={<SelectDepartmentPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            <Route path="/groups/:groupId" element={<GroupDetailPage />} />
            <Route path="/groups/:groupId/manage" element={<GroupManagePage />} />
            <Route
              path="/groups/:groupId/gathering/:gatheringId"
              element={<GatheringDetailPage />}
            />
            <Route
              path="/groups/:groupId/create"
              element={<CreateGatheringPage />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
