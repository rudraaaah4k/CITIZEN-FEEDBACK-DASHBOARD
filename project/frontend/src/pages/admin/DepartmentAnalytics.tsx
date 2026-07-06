import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquareText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { KPICard } from '../../components/shared/KPICard';
import { PieChartCard } from '../../components/charts/PieChartCard';
import { AreaChartCard } from '../../components/charts/AreaChartCard';
import { StatusBadge, PriorityBadge } from '../../components/shared/StatusBadge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useDepartmentAnalyticsById } from '../../hooks/useAnalytics';
import { formatDate, formatStatus } from '../../lib/utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DepartmentAnalytics() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useDepartmentAnalyticsById(id || '');

  if (isLoading || !data) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const { department, totals, charts, recentFeedback } = data;

  return (
    <div className="space-y-8">
      <div>
        <Link to="/admin/departments" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Departments
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white"
            style={{ backgroundColor: department.color }}
          >
            {department.code.slice(0, 2)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{department.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{department.description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Feedback" value={totals.total} icon={MessageSquareText} colorClass="from-indigo-500 to-purple-600" />
        <KPICard label="Resolved" value={totals.resolved} icon={CheckCircle2} colorClass="from-emerald-500 to-teal-600" />
        <KPICard label="Pending" value={totals.pending} icon={Clock} colorClass="from-amber-500 to-orange-600" />
        <KPICard label="Urgent" value={totals.urgent} icon={AlertTriangle} colorClass="from-red-500 to-rose-600" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">Avg. Rating</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{(totals.avgRating || 0).toFixed?.(1) ?? totals.avgRating} / 5</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">Resolution Rate</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {totals.total ? Math.round((totals.resolved / totals.total) * 100) : 0}%
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">Contact Email</p>
          <p className="mt-1 truncate text-sm font-semibold text-foreground">{department.email}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">Department Code</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{department.code}</p>
        </Card>
      </div>

      {charts.statusDistribution.length > 0 || charts.sentimentDistribution.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {charts.statusDistribution.length > 0 && (
            <PieChartCard
              title="Status Distribution"
              labels={charts.statusDistribution.map((s) => formatStatus(s._id))}
              data={charts.statusDistribution.map((s) => s.count)}
            />
          )}
          {charts.sentimentDistribution.length > 0 && (
            <PieChartCard
              title="Sentiment Distribution"
              labels={charts.sentimentDistribution.map((s) => s._id)}
              data={charts.sentimentDistribution.map((s) => s.count)}
            />
          )}
        </div>
      ) : null}

      {charts.monthlyTrend.length > 0 && (
        <AreaChartCard
          title="Monthly Feedback Volume"
          labels={charts.monthlyTrend.map((m) => `${MONTHS[m.month - 1]} ${m.year}`)}
          data={charts.monthlyTrend.map((m) => m.total)}
          label="Feedback"
        />
      )}

      {charts.topKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {charts.topKeywords.map((k) => (
                <span
                  key={k.word}
                  className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-muted-foreground"
                  style={{ fontSize: `${Math.min(16, 11 + k.count / 3)}px` }}
                >
                  #{k.word} · {k.count}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback for {department.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentFeedback.length === 0 ? (
            <EmptyState icon={MessageSquareText} title="No feedback yet" description="This department hasn't received any feedback." />
          ) : (
            recentFeedback.map((f) => (
              <Link
                key={f._id}
                to={`/admin/feedback/${f._id}`}
                className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-white/10 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.trackingId} · {formatDate(f.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <PriorityBadge priority={f.priority} />
                  <StatusBadge status={f.status} />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
