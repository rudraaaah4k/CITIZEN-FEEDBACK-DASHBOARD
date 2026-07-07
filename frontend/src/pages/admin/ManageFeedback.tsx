import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Trash2, Eye, MessageSquareText } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useFeedback, useDeleteFeedback } from '../../hooks/useFeedback';
import { useDebounce } from '../../hooks/useDebounce';
import { Feedback, FeedbackFilters, FeedbackStatus } from '../../types';
import { formatDate } from '../../lib/utils';

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Closed', value: 'closed' },
];

export default function ManageFeedback() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);
  const filters: FeedbackFilters = {
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: (status as FeedbackStatus) || undefined,
    priority: (priority as Feedback['priority']) || undefined,
  };

  const { data, isLoading } = useFeedback(filters);
  const { mutate: remove } = useDeleteFeedback();

  const feedbacks = data?.feedbacks || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review, prioritize, and resolve citizen feedback. Click any feedback to view its full summary.
        </p>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <Input placeholder="Search feedback..." leftIcon={<Search className="h-4 w-4" />} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <Select placeholder="All statuses" options={statusOptions} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} />
          <Select
            placeholder="All priorities"
            options={[
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
              { label: 'Critical', value: 'critical' },
            ]}
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
          />
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div>{Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}</div>
        ) : feedbacks.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={MessageSquareText} title="No feedback found" description="Try adjusting your filters." />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {feedbacks.map((f, i) => (
              <motion.div
                key={f._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex flex-col gap-3 p-5 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
              >
                <Link to={`/admin/feedback/${f._id}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{f.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {f.trackingId} · {f.department?.name} · {f.isAnonymous ? 'Anonymous' : f.submittedBy?.name || 'Unknown'} · {formatDate(f.createdAt)}
                  </p>
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <SentimentBadge sentiment={f.aiAnalysis?.sentiment || 'neutral'} />
                  <PriorityBadge priority={f.priority} />
                  <StatusBadge status={f.status} />
                  <Link to={`/admin/feedback/${f._id}`}>
                    <Button size="sm" variant="outline" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                      View
                    </Button>
                  </Link>
                  <button onClick={() => window.confirm('Delete this feedback?') && remove(f._id)} className="text-muted-foreground hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={!pagination.hasPrevPage} onClick={() => setPage((p) => p - 1)} leftIcon={<ChevronLeft className="h-4 w-4" />}>
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
          <Button variant="outline" size="sm" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)} rightIcon={<ChevronRight className="h-4 w-4" />}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
