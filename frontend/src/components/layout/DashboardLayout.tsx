import { Outlet } from 'react-router-dom';
import { Menu, Bell, LogOut } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useAuth } from '../../hooks/useAuth';
import { useUnreadCount } from '../../hooks/useNotifications';
import { AnimatedBackground } from '../shared/AnimatedBackground';
import { PageTransition } from '../shared/PageTransition';
import { Link } from 'react-router-dom';

export const DashboardLayout = () => {
  const { user } = useAuthStore();
  const { setSidebarOpen } = useUIStore();
  const { logout } = useAuth();
  const { data: unreadCount } = useUnreadCount();

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Sidebar />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-white/5 bg-slate-950/70 px-4 backdrop-blur-xl sm:px-6">
          <button className="text-muted-foreground lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Link to="/notifications" className="relative text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-5 w-5" />
            {!!unreadCount && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-2">
            <Avatar name={user?.name || 'U'} src={user?.avatar} size={34} />
            <div className="hidden text-sm sm:block">
              <p className="font-medium text-foreground leading-tight">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize leading-tight">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};
