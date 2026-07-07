import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, UserCircle, LogOut } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useAuthStore } from '../../stores/authStore';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

export const UserMenu = () => {
  const { user } = useAuthStore();
  const { logout, isLogoutLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/5"
      >
        <Avatar name={user?.name || 'U'} src={user?.avatar} size={34} />
        <div className="hidden text-left text-sm sm:block">
          <p className="font-medium leading-tight text-foreground transition-colors group-hover:text-indigo-300">
            {user?.name}
          </p>
          <p className="text-xs capitalize leading-tight text-muted-foreground">{user?.role}</p>
        </div>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl"
          >
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground transition-colors hover:bg-white/5"
            >
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              My Profile
            </Link>
            <button
              onClick={() => {
                setOpen(false);
                setConfirmOpen(true);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Log out?">
        <p className="text-sm text-muted-foreground">
          Are you sure you want to log out? You'll need to sign in again to access your dashboard.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" isLoading={isLogoutLoading} onClick={() => logout()}>
            Log Out
          </Button>
        </div>
      </Modal>
    </div>
  );
};
