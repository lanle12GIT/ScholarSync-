import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import WelcomePage from './pages/WelcomePage';
import DashboardPage from './pages/DashboardPage';
import PaperPage from './pages/PaperPage';
import PaperDetailPage from './pages/PaperDetailPage';
import TopicsPage from './pages/TopicsPage';
import FavoritesPage from './pages/FavoritesPage';
import AuthPage from './pages/AuthPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
         <Route path="/topics" element={<TopicsPage />} />
        <Route path="/paper" element={<PaperPage />} />
        <Route path="/paper/:id" element={<PaperDetailPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
