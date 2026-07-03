import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquarePlus,
  History,
  Search,
  Bell,
  UserCircle,
  Users,
  Building2,
  BarChart3,
  FileBarChart,
  MessageSquareText,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';

const citizenLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/submit-feedback', label: 'Submit Feedback', icon: MessageSquarePlus },
  { to: '/my-feedback', label: 'My Feedback', icon: History },
  { to: '/track', label: 'Track Complaint', icon: Search },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/feedback', label: 'Manage Feedback', icon: MessageSquarePlus },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
  { to: '/admin/departments', label: 'Departments', icon: Building2 },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

export const Sidebar = () => {
  const { user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const links = user?.role === 'citizen' ? citizenLinks : adminLinks;

  const content = (
    <>
      <div className="flex h-16 items-center gap-2 px-6 font-bold text-lg text-foreground">
        <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5">
          <MessageSquareText className="h-5 w-5 text-white" />
        </div>
        CivicPulse
        <button className="ml-auto lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex flex-col gap-1 px-3 py-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors relative',
                isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/80 to-purple-600/80"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <link.icon className="h-4 w-4 relative z-10" />
                <span className="relative z-10">{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/5 bg-slate-950/80 backdrop-blur-xl lg:flex">
        {content}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-white/5 bg-slate-950 backdrop-blur-xl"
          >
            {content}
          </motion.aside>
        </div>
      )}
    </>
  );
};
