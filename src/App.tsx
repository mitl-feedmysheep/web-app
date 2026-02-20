import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import SplashScreen from "@/features/auth/SplashScreen";
import LoginPage from "@/features/auth/LoginPage";
import SelectChurchPage from "@/features/auth/SelectChurchPage";
import HomePage from "@/features/home/HomePage";
import GroupListPage from "@/features/group/GroupListPage";
import GroupDetailPage from "@/features/group/GroupDetailPage";
import GatheringDetailPage from "@/features/gathering/GatheringDetailPage";
import CreateGatheringPage from "@/features/gathering/CreateGatheringPage";
import PrayerPage from "@/features/prayer/PrayerPage";
import MyPage from "@/features/my/MyPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          {/* Auth */}
          <Route path="/splash" element={<SplashScreen />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/select-church" element={<SelectChurchPage />} />

          {/* Main tabs */}
          <Route path="/" element={<HomePage />} />
          <Route path="/groups" element={<GroupListPage />} />
          <Route path="/prayers" element={<PrayerPage />} />
          <Route path="/my" element={<MyPage />} />

          {/* Group detail & Gathering */}
          <Route path="/groups/:groupId" element={<GroupDetailPage />} />
          <Route
            path="/groups/:groupId/gathering/:gatheringId"
            element={<GatheringDetailPage />}
          />
          <Route
            path="/groups/:groupId/create"
            element={<CreateGatheringPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
