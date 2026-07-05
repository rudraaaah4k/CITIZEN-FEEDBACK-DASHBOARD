import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, Clock, XCircle, MessageSquareText } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../../components/shared/StatusBadge';
import { useTrackFeedback } from '../../hooks/useFeedback';
import { LocationMap } from '../../components/shared/LocationMap';
import { AnimatedBackground } from '../../components/shared/AnimatedBackground';
import { formatDateTime, cn } from '../../lib/utils';

const timelineIcon = (status: string) => {
  if (status === 'resolved') return CheckCircle2;
  if (status === 'rejected') return XCircle;
  return Clock;
};

export default function TrackFeedback() {
  const [input, setInput] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const { data: feedback, isLoading, isError } = useTrackFeedback(trackingId, !!trackingId);

  return (
    <div className="relative min-h-screen px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <AnimatedBackground />
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <MessageSquareText className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground">Track Your Complaint</h1>
          <p className="mt-2 text-muted-foreground">Enter your tracking ID to see the latest status.</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTrackingId(input.trim());
          }}
          className="mt-8 flex gap-3"
        >
          <Input placeholder="e.g. CFB-2026-000123" value={input} onChange={(e) => setInput(e.target.value)} className="flex-1" />
          <Button type="submit" leftIcon={<Search className="h-4 w-4" />} isLoading={isLoading}>
            Track
          </Button>
        </form>

        {isError && trackingId && (
          <p className="mt-6 text-center text-sm text-red-400">No feedback found for that tracking ID. Please check and try again.</p>
        )}

        {feedback && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{feedback.trackingId}</p>
                  <h2 className="mt-1 text-lg font-semibold text-foreground">{feedback.title}</h2>
                </div>
                <div className="flex gap-2">
                  <PriorityBadge priority={feedback.priority} />
                  <StatusBadge status={feedback.status} />
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{feedback.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <SentimentBadge sentiment={feedback.aiAnalysis?.sentiment || 'neutral'} />
                {feedback.department?.name && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground">
                    {feedback.department.name}
                  </span>
                )}
              </div>

              {feedback.location?.coordinates && (
                <div className="mt-6">
                  <p className="mb-2 text-xs text-muted-foreground">Reported location</p>
                  <LocationMap
                    lat={feedback.location.coordinates.lat}
                    lng={feedback.location.coordinates.lng}
                    label={feedback.location.address}
                  />
                </div>
              )}

              <div className="mt-8">
                <p className="mb-4 text-sm font-medium text-foreground">Status Timeline</p>
                <div className="space-y-4">
                  {(feedback.statusHistory || []).map((h, i) => {
                    const Icon = timelineIcon(h.status);
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                              h.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : h.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          {i < feedback.statusHistory.length - 1 && <div className="mt-1 h-full w-px flex-1 bg-white/10" />}
                        </div>
                        <div className="pb-4">
                          <StatusBadge status={h.status} />
                          <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(h.changedAt)}</p>
                          {h.note && <p className="mt-1 text-sm text-muted-foreground">{h.note}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
