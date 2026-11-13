import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { api } from './services/api';
import { ScrollToTop } from './components/ScrollToTop';
import { GlobalDialog } from './components/ui/GlobalDialog';

const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const NoticesPage = lazy(() => import('./pages/NoticesPage').then((m) => ({ default: m.NoticesPage })));
const CalendarPage = lazy(() => import('./pages/CalendarPage').then((m) => ({ default: m.CalendarPage })));
const CommunityPage = lazy(() => import('./pages/CommunityPage').then((m) => ({ default: m.CommunityPage })));
const StudyMaterialsPage = lazy(() => import('./pages/StudyMaterialsPage').then((m) => ({ default: m.StudyMaterialsPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then((m) => ({ default: m.AccountPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));

const PageFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center text-slate-500 text-sm font-medium">
    페이지를 불러오는 중입니다...
  </div>
);

export function App() {
  useEffect(() => {
    // 과거 브라우저 로컬스토리지 잔여 캐시 전면 정리 (큰 글씨 모드 제외)
    api.clearLegacyBrowserStorage();
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <GlobalDialog />
      <Layout>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/notices" element={<NoticesPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/studies" element={<StudyMaterialsPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/governance" element={<Navigate to="/notices?tab=finance" replace />} />
            <Route path="/welfare" element={<Navigate to="/community" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
