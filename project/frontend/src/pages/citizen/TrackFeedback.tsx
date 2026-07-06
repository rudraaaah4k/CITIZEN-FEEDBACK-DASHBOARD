import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquarePlus, ChevronLeft, ChevronRight, Search, BrainCircuit } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useMyFeedback } from '../../hooks/useFeedback';
import { formatDate } from '../../lib/utils';

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Closed', value: 'closed' },
];

export default function TrackFeedback() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading } = useMyFeedback({ page, limit: 8, status: status || undefined });
  const feedbacks = data?.feedbacks || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Track Your Complaints</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Follow the live status and AI analysis of everything you've submitted.
          </p>
        </div>
        <Link to="/submit-feedback">
          <Button leftIcon={<MessageSquarePlus className="h-4 w-4" />}>New Feedback</Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="max-w-xs">
          <Select
            placeholder="All statuses"
            options={statusOptions}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Search} title="No complaints found" description="Try adjusting your filters or submit a new complaint." />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {feedbacks.map((f, i) => (
              <motion.div key={f._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                <Link
                  to={`/feedback/${f._id}`}
                  className="flex flex-col gap-3 p-5 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{f.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {f.trackingId} · {f.department?.name} · {formatDate(f.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <SentimentBadge sentiment={f.aiAnalysis?.sentiment || 'neutral'} />
                    <PriorityBadge priority={f.priority} />
                    <StatusBadge status={f.status} />
                    <span className="flex items-center gap-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-2.5 py-1 text-xs text-indigo-300">
                      <BrainCircuit className="h-3 w-3" /> AI Analysis
                    </span>
                  </div>
                </Link>
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
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)} rightIcon={<ChevronRight className="h-4 w-4" />}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
