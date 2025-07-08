import { AppSidebar } from './app-sidebar';
import { SiteHeader } from './site-header';
import { SidebarProvider } from '../ui/sidebar';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };
  // Determine current page for sidebar highlighting
  const path = location.pathname;
  let currentPage = 'dashboard';
  if (path.startsWith('/dashboard')) currentPage = 'dashboard';
  else if (path.startsWith('/analytics')) currentPage = 'analytics';
  else if (path.startsWith('/projects')) currentPage = 'projects';
  else if (path.startsWith('/team')) currentPage = 'team';
  else if (path.startsWith('/settings')) currentPage = 'settings';
  else if (path.startsWith('/help')) currentPage = 'help';
  else if (path.startsWith('/search')) currentPage = 'search';
  else if (path.startsWith('/profile')) currentPage = 'profile';
  else if (path.startsWith('/vizard')) currentPage = 'vizard';

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar
          onLogout={handleLogout}
          currentPage={currentPage}
          onNavigate={(page) => {
            // Use react-router navigation
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
              default:
                navigate('/dashboard');
            }
          }}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <SiteHeader />
          <main className="flex-1 w-full min-w-0 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
} 