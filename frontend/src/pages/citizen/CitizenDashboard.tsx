import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquarePlus, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { KPICard } from '../../components/shared/KPICard';
import { StatusBadge, PriorityBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { useMyFeedback } from '../../hooks/useFeedback';
import { useAuthStore } from '../../stores/authStore';
import { formatDate } from '../../lib/utils';

export default function CitizenDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useMyFeedback({ page: 1, limit: 5 });
  const feedbacks = data?.feedbacks || [];

  const pending = feedbacks.filter((f) => ['pending', 'under_review', 'in_progress'].includes(f.status)).length;
  const resolved = feedbacks.filter((f) => f.status === 'resolved').length;
  const urgent = feedbacks.filter((f) => f.aiAnalysis?.isUrgent).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's a summary of your civic feedback activity.</p>
        </div>
        <Link to="/submit-feedback">
          <Button leftIcon={<MessageSquarePlus className="h-4 w-4" />}>Submit Feedback</Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <KPICard label="In Progress" value={pending} icon={Clock} colorClass="from-amber-500 to-orange-600" />
        <KPICard label="Resolved" value={resolved} icon={CheckCircle2} colorClass="from-emerald-500 to-teal-600" />
        <KPICard label="Urgent Flags" value={urgent} icon={AlertTriangle} colorClass="from-red-500 to-rose-600" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Feedback</CardTitle>
          <Link to="/my-feedback" className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : feedbacks.length === 0 ? (
            <EmptyState
              icon={MessageSquarePlus}
              title="No feedback yet"
              description="Submit your first piece of feedback to see it tracked here."
              action={
                <Link to="/submit-feedback">
                  <Button size="sm">Submit Feedback</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {feedbacks.map((f, i) => (
                <motion.div
                  key={f._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/feedback/${f._id}`}
                    className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{f.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.trackingId} · {formatDate(f.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <PriorityBadge priority={f.priority} />
                      <StatusBadge status={f.status} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
