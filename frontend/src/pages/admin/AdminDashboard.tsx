import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, MessageSquareText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { KPICard } from '../../components/shared/KPICard';
import { PieChartCard } from '../../components/charts/PieChartCard';
import { AreaChartCard } from '../../components/charts/AreaChartCard';
import { StatusBadge, PriorityBadge } from '../../components/shared/StatusBadge';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { useDashboardStats } from '../../hooks/useAnalytics';
import { formatDate, formatStatus } from '../../lib/utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const { data, isLoading } = useDashboardStats();

  if (isLoading || !data) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const { kpi, charts, recentFeedback } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live snapshot of citizen feedback across all departments.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Feedback" value={kpi.totalFeedback} icon={MessageSquareText} change={kpi.feedbackGrowth} colorClass="from-indigo-500 to-purple-600" />
        <KPICard label="Resolved" value={kpi.resolvedFeedback} icon={CheckCircle2} colorClass="from-emerald-500 to-teal-600" />
        <KPICard label="Urgent" value={kpi.urgentFeedback} icon={AlertTriangle} colorClass="from-red-500 to-rose-600" />
        <KPICard label="Total Users" value={kpi.totalUsers} icon={Users} colorClass="from-blue-500 to-cyan-600" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">Avg. Rating</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{kpi.avgRating} / 5</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">Resolution Rate</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{kpi.resolutionRate}%</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">This Month</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{kpi.currentMonthFeedback}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{kpi.pendingFeedback}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PieChartCard
          title="Sentiment Distribution"
          labels={charts.sentimentDistribution.map((s) => s._id)}
          data={charts.sentimentDistribution.map((s) => s.count)}
        />
        <PieChartCard
          title="Status Distribution"
          labels={charts.statusDistribution.map((s) => formatStatus(s._id))}
          data={charts.statusDistribution.map((s) => s.count)}
        />
      </div>

      <AreaChartCard
        title="Monthly Feedback Volume"
        labels={charts.monthlyTrend.map((m) => `${MONTHS[m.month - 1]} ${m.year}`)}
        data={charts.monthlyTrend.map((m) => m.total)}
        label="Feedback"
      />

      {charts.topKeywords?.length > 0 && (
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Feedback</CardTitle>
          <Link to="/admin/feedback" className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300">
            Manage all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentFeedback.map((f, i) => (
            <motion.div
              key={f._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
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
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
