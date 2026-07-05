import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../../hooks/useNotifications';
import { timeAgo, cn } from '../../lib/utils';

export default function Notifications() {
  const { data, isLoading } = useNotifications({ limit: 30 });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const notifications = data?.notifications || [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Stay updated on your feedback status.</p>
        </div>
        {!!notifications.length && (
          <Button variant="outline" size="sm" leftIcon={<CheckCheck className="h-4 w-4" />} onClick={() => markAllAsRead()}>
            Mark all read
          </Button>
        )}
      </div>

      <Card>
        {isLoading ? (
          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((n, i) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !n.isRead && markAsRead(n._id)}
                className={cn('flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-white/[0.03]', !n.isRead && 'bg-indigo-500/[0.04]')}
              >
                <div className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', !n.isRead ? 'bg-indigo-400' : 'bg-transparent')} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n._id);
                  }}
                  className="text-muted-foreground hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
