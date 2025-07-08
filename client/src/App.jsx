import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/features/LandingPage';
import AuthContainer from './components/features/auth/AuthContainer';
import Dashboard from './components/features/dashboard/Dashboard';
import AnalyticsPage from './components/features/AnalyticsPage';
import { ThemeProvider } from './components/common/theme-provider';
import MainLayout from './components/layout/MainLayout';

function LandingPageWithAuthNav() {
  const navigate = useNavigate();
  return <LandingPage onGetStarted={() => navigate('/auth')} onSignIn={() => navigate('/auth')} />;
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPageWithAuthNav />} />
          <Route path="/auth" element={<AuthContainer onLogin={() => window.location.href = '/dashboard'} />} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/analytics" element={<MainLayout><AnalyticsPage /></MainLayout>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 