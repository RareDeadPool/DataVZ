import { AppSidebar } from './app-sidebar';
import { SiteHeader } from './site-header';
import { SidebarProvider } from '../ui/sidebar';
import Dashboard from '../features/dashboard/Dashboard';
import AnalyticsPage from '../features/AnalyticsPage';
import ProjectsPage from '../features/Projects';
import TeamsPage from '../features/TeamsPage';
import { useState } from 'react';

export default function MainLayout({ children }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };
  let pageComponent;
  switch (currentPage) {
    case 'dashboard':
      pageComponent = <Dashboard />;
      break;
    case 'analytics':
      pageComponent = <AnalyticsPage />;
      break;
    case 'projects':
      pageComponent = <ProjectsPage />;
      break;
    case 'team':
      pageComponent = <TeamsPage />;
      break;
    default:
      pageComponent = children;
  }
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar onLogout={handleLogout} currentPage={currentPage} onNavigate={setCurrentPage} />
        <div className="flex-1 flex flex-col min-w-0">
          <SiteHeader />
          <main className="flex-1 w-full min-w-0 overflow-auto">{pageComponent}</main>
        </div>
      </div>
    </SidebarProvider>
  );
} 