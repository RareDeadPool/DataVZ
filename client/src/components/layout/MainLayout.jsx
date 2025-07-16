import { AppSidebar } from './app-sidebar';
import { SiteHeader } from './site-header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  // Determine current page for sidebar highlighting
  const path = location.pathname;
  let currentPage = 'dashboard';
  let pageTitle = 'Dashboard';
  
  if (path.startsWith('/dashboard')) {
    currentPage = 'dashboard';
    pageTitle = 'Dashboard';
  } else if (path.startsWith('/analytics')) {
    currentPage = 'analytics';
    pageTitle = 'Analytics';
  } else if (path.startsWith('/projects')) {
    currentPage = 'projects';
    pageTitle = 'Projects';
  } else if (path.startsWith('/team')) {
    currentPage = 'team';
    pageTitle = 'Team';
  } else if (path.startsWith('/settings')) {
    currentPage = 'settings';
    pageTitle = 'Settings';
  } else if (path.startsWith('/help')) {
    currentPage = 'help';
    pageTitle = 'Help & Support';
  } else if (path.startsWith('/search')) {
    currentPage = 'search';
    pageTitle = 'Search';
  } else if (path.startsWith('/profile')) {
    currentPage = 'profile';
    pageTitle = 'Profile';
  } else if (path.startsWith('/vizard')) {
    currentPage = 'vizard';
    pageTitle = 'Ask Vizard';
  }

  const handleNavigate = (page) => {
    switch (page) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      case 'projects':
        navigate('/projects');
        break;
      case 'team':
        navigate('/team');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'help':
        navigate('/help');
        break;
      case 'search':
        navigate('/search');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'vizard':
        navigate('/vizard');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleQuickCreate = () => {
    // Navigate to projects with create mode or show create modal
    navigate('/projects?create=true');
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full overflow-hidden bg-background theme-transition flex-col md:flex-row">
        {/* Mobile sidebar overlay */}
        <div className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${mobileSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setMobileSidebarOpen(false)} />
        <AppSidebar
          onLogout={handleLogout}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onQuickCreate={handleQuickCreate}
          className={`animate-fade-in ${mobileSidebarOpen ? 'fixed z-50 left-0 top-0 h-full w-64 bg-background shadow-lg md:static md:block' : 'hidden md:block'}`}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 theme-transition">
          <SiteHeader 
            title={pageTitle}
            onQuickCreate={handleQuickCreate}
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
            className="animate-slide-in-right"
          />
          <main className="flex-1 w-full min-w-0 overflow-auto bg-background p-2 sm:p-4">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}