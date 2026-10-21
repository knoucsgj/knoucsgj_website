import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { NoticesPage } from './pages/NoticesPage';
import { CalendarPage } from './pages/CalendarPage';
import { CommunityPage } from './pages/CommunityPage';
import { StudyMaterialsPage } from './pages/StudyMaterialsPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  return (
    <BrowserRouter>
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
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
