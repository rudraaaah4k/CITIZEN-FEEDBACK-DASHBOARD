import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building2, Calendar, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../../components/shared/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useTrackFeedback } from '../../hooks/useFeedback';
import { formatDate, formatDateTime, formatStatus } from '../../lib/utils';

export default function TrackFeedback() {
  const [inputValue, setInputValue] = useState('');
  const [searchedId, setSearchedId] = useState('');

  const { data: feedback, isLoading, isError, error } = useTrackFeedback(searchedId, !!searchedId);

  const notFoundMessage =
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    'No feedback found with this tracking ID. Double-check and try again.';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) setSearchedId(trimmed);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Track Your Complaint</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your tracking ID to check the live status of your complaint.
        </p>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="e.g. CFB-MRAHZ9IL-6W14"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <Button type="submit" isLoading={isLoading} disabled={!inputValue.trim()}>
            Track
          </Button>
        </form>
      </Card>

      <AnimatePresence mode="wait">
        {searchedId && isError && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="p-6">
              <EmptyState icon={AlertCircle} title="Complaint not found" description={notFoundMessage} />
            </Card>
          </motion.div>
        )}

        {feedback && !isError && (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-mono text-indigo-300">{feedback.trackingId}</p>
                  <h2 className="mt-1 text-lg font-semibold text-foreground">{feedback.title}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SentimentBadge sentiment={feedback.aiAnalysis?.sentiment || 'neutral'} />
                  <PriorityBadge priority={feedback.priority} />
                  <StatusBadge status={feedback.status} />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{feedback.description}</p>

              <div className="grid grid-cols-1 gap-3 border-t border-white/5 pt-4 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {feedback.department?.name || 'Unassigned'}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Submitted {formatDate(feedback.createdAt)}
                </div>
                {feedback.location?.city && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {feedback.location.city}, {feedback.location.state}
                  </div>
                )}
              </div>

              {feedback.statusHistory?.length > 0 && (
                <div className="border-t border-white/5 pt-4">
                  <p className="mb-3 text-sm font-medium text-foreground">Status history</p>
                  <div className="space-y-3">
                    {feedback.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
                        <div>
                          <p className="text-foreground">{formatStatus(h.status)}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(h.changedAt)}</p>
                          {h.note && <p className="mt-0.5 text-xs text-muted-foreground">{h.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}