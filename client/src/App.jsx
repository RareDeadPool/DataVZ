import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/features/LandingPage';
import AuthContainer from './components/features/auth/AuthContainer';
import Dashboard from './components/features/dashboard/Dashboard';
import AnalyticsPage from './components/features/AnalyticsPage';
import ProjectWorkspace from './components/features/ProjectWorkspace';
import ProjectsPage from './components/features/Projects';
import AcceptProject from './components/features/AcceptProject';

import Vizard from './components/features/AskAI';
import SearchPage from './components/features/SearchPage';
import HelpPage from './components/features/HelpPage';
import Profile from './components/features/Profile';
import SettingsPage from './components/features/SettingsPage';
import ProjectCreationTest from './components/features/ProjectCreationTest';
import ProjectCreationDebug from './components/features/ProjectCreationDebug';
import RequestPasswordReset from './components/features/auth/RequestPasswordReset';
import ResetPassword from './components/features/auth/ResetPassword';
import { ThemeProvider } from './components/common/theme-provider';
import MainLayout from './components/layout/MainLayout';
import { useDispatch, useSelector } from 'react-redux';
import { login } from './store/slices/authSlice';
import { Toaster } from 'sonner';
import { Navigate, useLocation } from 'react-router-dom';
import AdminDashboard from './components/features/AdminDashboard';

function LandingPageWithAuthNav() {
  const navigate = useNavigate();
  return <LandingPage onGetStarted={() => navigate('/auth')} onSignIn={() => navigate('/auth')} />;
}

function PrivateRoute({ children }) {
  const user = useSelector(state => state.auth.user);
  const location = useLocation();
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const user = useSelector(state => state.auth.user);
  const location = useLocation();
  if (!user || user.role !== 'admin') {
    return <Navigate to={`/dashboard`} replace />;
  }
  return children;
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
          <Route path="/auth" element={<AuthContainer />} />
          <Route path="/login" element={<AuthContainer />} />
          <Route path="/request-password-reset" element={<RequestPasswordReset />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<PrivateRoute><MainLayout><Dashboard /></MainLayout></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><MainLayout><AnalyticsPage /></MainLayout></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute><MainLayout><ProjectsPage /></MainLayout></PrivateRoute>} />
          <Route path="/projects/:projectId" element={<PrivateRoute><MainLayout><ProjectWorkspace /></MainLayout></PrivateRoute>} />
          <Route path="/workspace/:projectId" element={<PrivateRoute><MainLayout><ProjectWorkspace /></MainLayout></PrivateRoute>} />

          <Route path="/vizard" element={<PrivateRoute><MainLayout><Vizard /></MainLayout></PrivateRoute>} />
          <Route path="/search" element={<PrivateRoute><MainLayout><SearchPage /></MainLayout></PrivateRoute>} />
          <Route path="/help" element={<PrivateRoute><MainLayout><HelpPage /></MainLayout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><MainLayout><Profile /></MainLayout></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><MainLayout><SettingsPage /></MainLayout></PrivateRoute>} />
          <Route path="/test-project" element={<PrivateRoute><MainLayout><ProjectCreationTest /></MainLayout></PrivateRoute>} />
          <Route path="/debug-project" element={<PrivateRoute><MainLayout><ProjectCreationDebug /></MainLayout></PrivateRoute>} />
          <Route path="/accept-project" element={<AcceptProject />} />
          <Route path="/admin" element={<AdminRoute><MainLayout><AdminDashboard /></MainLayout></AdminRoute>} />
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