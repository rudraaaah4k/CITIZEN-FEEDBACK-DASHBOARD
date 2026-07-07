import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Paperclip, BrainCircuit, Download, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge, PriorityBadge, SentimentBadge } from '../../components/shared/StatusBadge';
import { StarRating } from '../../components/ui/StarRating';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useFeedbackById, useUpdateFeedbackStatus, useDownloadFeedbackPDF } from '../../hooks/useFeedback';
import { useFeedbackRealtime } from '../../hooks/useRealtime';
import { FeedbackStatus } from '../../types';
import { formatDateTime, cn } from '../../lib/utils';

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Closed', value: 'closed' },
];

export default function FeedbackSummary() {
  const { id } = useParams<{ id: string }>();
  const { data: feedback, isLoading } = useFeedbackById(id || '');
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateFeedbackStatus();
  const { mutate: downloadPDF, isPending: isDownloading } = useDownloadFeedbackPDF();

  useFeedbackRealtime(id);

  const [status, setStatus] = useState<FeedbackStatus>('pending');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (feedback) setStatus(feedback.status);
  }, [feedback]);

  if (isLoading) return <FullPageSpinner />;
  if (!feedback) return <p className="text-muted-foreground">Feedback not found.</p>;

  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/feedback" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Manage Feedback
        </Link>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="h-4 w-4" />}
          isLoading={isDownloading}
          onClick={() => downloadPDF({ id: feedback._id, trackingId: feedback.trackingId })}
        >
          Download PDF Summary
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{feedback.trackingId}</p>
            <h1 className="mt-1 text-xl font-bold text-foreground">{feedback.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <PriorityBadge priority={feedback.priority} />
            <StatusBadge status={feedback.status} />
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{feedback.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span>{feedback.department?.name}</span>
          <span>·</span>
          <span>{feedback.category?.name}</span>
          <span>·</span>
          <span>{feedback.isAnonymous ? 'Anonymous' : feedback.submittedBy?.name || 'Unknown'}</span>
          <span>·</span>
          <span>{formatDateTime(feedback.createdAt)}</span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Citizen rating:</span>
          <StarRating value={feedback.rating} readOnly size={16} />
        </div>

        {feedback.attachments?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {feedback.attachments.map((a, i) => (
              <a
                key={i}
                href={`${apiBase}${a.url}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Paperclip className="h-3.5 w-3.5" /> {a.originalName}
              </a>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select label="Status" options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value as FeedbackStatus)} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground/90">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note about this status change..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <Button
            isLoading={isUpdating}
            disabled={status === feedback.status && !note}
            onClick={() =>
              updateStatus(
                { id: feedback._id, status, note: note || undefined },
                { onSuccess: () => setNote('') }
              )
            }
          >
            Save Status
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-indigo-400" /> AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <p className="text-xs text-muted-foreground">Sentiment</p>
              <div className="mt-1">
                <SentimentBadge sentiment={feedback.aiAnalysis.sentiment} />
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <p className="text-xs text-muted-foreground">Urgency Score</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{(feedback.aiAnalysis.urgencyScore * 100).toFixed(0)}%</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <p className="text-xs text-muted-foreground">Language</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{feedback.aiAnalysis.language?.toUpperCase()}</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-muted-foreground">Emotion breakdown</p>
            <div className="space-y-2">
              {Object.entries(feedback.aiAnalysis.emotions || {}).map(([emotion, score]) => (
                <div key={emotion} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs capitalize text-muted-foreground">{emotion}</span>
                  <ProgressBar value={(score as number) * 100} className="flex-1" />
                  <span className="w-8 text-right text-xs text-muted-foreground">{Math.round((score as number) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          {feedback.aiAnalysis.keywords?.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {feedback.aiAnalysis.keywords.map((k) => (
                  <span key={k} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-muted-foreground">
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {feedback.aiAnalysis.summary && (
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <p className="text-xs font-medium text-indigo-300">AI Summary</p>
              <p className="mt-1 text-sm text-muted-foreground">{feedback.aiAnalysis.summary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {feedback.statusHistory?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" /> Status Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedback.statusHistory.map((h, i) => (
                <div key={i} className="flex gap-3">
                  <div className={cn('h-2 w-2 shrink-0 rounded-full mt-1.5', h.status === 'resolved' ? 'bg-emerald-400' : 'bg-indigo-400')} />
                  <div>
                    <StatusBadge status={h.status} />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateTime(h.changedAt)}{h.changedBy?.name ? ` · by ${h.changedBy.name}` : ''}
                    </p>
                    {h.note && <p className="mt-1 text-sm text-muted-foreground">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
