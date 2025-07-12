import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/features/LandingPage';
import AuthContainer from './components/features/auth/AuthContainer';
import Dashboard from './components/features/dashboard/Dashboard';
import AnalyticsPage from './components/features/AnalyticsPage';
import ProjectWorkspace from './components/features/ProjectWorkspace';
import ProjectsPage from './components/features/Projects';

import Vizard from './components/features/AskAI';
import SearchPage from './components/features/SearchPage';
import HelpPage from './components/features/HelpPage';
import Profile from './components/features/Profile';
import SettingsPage from './components/features/SettingsPage';
import ProjectCreationTest from './components/features/ProjectCreationTest';
import ProjectCreationDebug from './components/features/ProjectCreationDebug';
import { ThemeProvider } from './components/common/theme-provider';
import MainLayout from './components/layout/MainLayout';
import { useDispatch } from 'react-redux';
import { login } from './store/slices/authSlice';
import { Toaster } from 'sonner';

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
          <Route path="/workspace/:projectId" element={<MainLayout><ProjectWorkspace /></MainLayout>} />

          <Route path="/vizard" element={<MainLayout><Vizard /></MainLayout>} />
          <Route path="/search" element={<MainLayout><SearchPage /></MainLayout>} />
          <Route path="/help" element={<MainLayout><HelpPage /></MainLayout>} />
          <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
          <Route path="/settings" element={<MainLayout><SettingsPage /></MainLayout>} />
          <Route path="/test-project" element={<MainLayout><ProjectCreationTest /></MainLayout>} />
          <Route path="/debug-project" element={<MainLayout><ProjectCreationDebug /></MainLayout>} />
        </Routes>
      </Router>
      <Toaster 
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
    </ThemeProvider>
  );
}

export default App; 