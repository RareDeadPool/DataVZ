import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/features/LandingPage';
import AuthContainer from './components/features/auth/AuthContainer';
import Dashboard from './components/features/dashboard/Dashboard';
import AnalyticsPage from './components/features/AnalyticsPage';
import ProjectWorkspace from './components/features/ProjectWorkspace';
import ProjectsPage from './components/features/Projects';
import TeamsPage from './components/features/TeamsPage';
import { ThemeProvider } from './components/common/theme-provider';
import MainLayout from './components/layout/MainLayout';
import { useDispatch } from 'react-redux';
import { login } from './store/slices/authSlice';

function LandingPageWithAuthNav() {
  const navigate = useNavigate();
  return <LandingPage onGetStarted={() => navigate('/auth')} onSignIn={() => navigate('/auth')} />;
}

function App() {
  const dispatch = useDispatch();
  React.useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          dispatch(login(data));
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchProfile();
  }, [dispatch]);
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPageWithAuthNav />} />
          <Route path="/auth" element={<AuthContainer onLogin={() => window.location.href = '/dashboard'} />} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/analytics" element={<MainLayout><AnalyticsPage /></MainLayout>} />
          <Route path="/projects" element={<MainLayout><ProjectsPage /></MainLayout>} />
          <Route path="/projects/:projectId" element={<MainLayout><ProjectWorkspace /></MainLayout>} />
          <Route path="/team" element={<MainLayout><TeamsPage /></MainLayout>} />
          <Route path="/teams" element={<MainLayout><TeamsPage /></MainLayout>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 