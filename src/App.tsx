import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { NoticesPage } from './pages/NoticesPage';
import { CalendarPage } from './pages/CalendarPage';
import { CommunityPage } from './pages/CommunityPage';
import { StudyMaterialsPage } from './pages/StudyMaterialsPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { api } from './services/api';
import { ScrollToTop } from './components/ScrollToTop';
import { GlobalDialog } from './components/ui/GlobalDialog';

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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/notices" element={<NoticesPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/studies" element={<StudyMaterialsPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/governance" element={<Navigate to="/notices?category=결산" replace />} />
          <Route path="/welfare" element={<Navigate to="/community" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
