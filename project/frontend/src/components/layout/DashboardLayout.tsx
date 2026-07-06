import { Outlet, Link } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { UserMenu } from './UserMenu';
import { useUIStore } from '../../stores/uiStore';
import { useUnreadCount } from '../../hooks/useNotifications';
import { useRealtime } from '../../hooks/useRealtime';
import { AnimatedBackground } from '../shared/AnimatedBackground';
import { PageTransition } from '../shared/PageTransition';

export const DashboardLayout = () => {
  const { setSidebarOpen } = useUIStore();
  const { data: unreadCount } = useUnreadCount();
  useRealtime();

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Sidebar />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/5 bg-slate-950/70 px-4 backdrop-blur-xl sm:px-8">
          <button className="text-muted-foreground lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Link
            to="/notifications"
            className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            {!!unreadCount && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <div className="h-6 w-px bg-white/10" />
          <UserMenu />
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
