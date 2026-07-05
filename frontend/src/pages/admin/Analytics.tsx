import { PieChartCard } from '../../components/charts/PieChartCard';
import { BarChartCard } from '../../components/charts/BarChartCard';
import { LineChartCard } from '../../components/charts/LineChartCard';
import { RadarChartCard } from '../../components/charts/RadarChartCard';
import { AreaChartCard } from '../../components/charts/AreaChartCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { useDashboardStats, useDepartmentAnalytics, useSentimentTrend, useTopicAnalysis, useEmotionAnalytics } from '../../hooks/useAnalytics';
import { formatStatus } from '../../lib/utils';

export default function Analytics() {
  const { data: dashboard, isLoading: loadingDashboard } = useDashboardStats();
  const { data: deptAnalytics } = useDepartmentAnalytics();
  const { data: trendData } = useSentimentTrend(30);
  const { data: topics } = useTopicAnalysis();
  const { data: emotions } = useEmotionAnalytics();

  if (loadingDashboard || !dashboard) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  const { charts } = dashboard;

  // Build date-sentiment trend series
  const dates = Array.from(new Set((trendData?.trend as any[] || []).map((t) => t._id.date))).sort();
  const sentimentSeries = ['positive', 'negative', 'neutral'].map((s) => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    data: dates.map((date) => {
      const match = (trendData?.trend as any[] || []).find((t) => t._id.date === date && t._id.sentiment === s);
      return match ? match.count : 0;
    }),
    color: s === 'positive' ? '#10b981' : s === 'negative' ? '#ef4444' : '#64748b',
  }));

  const emotionEntries = emotions ? Object.entries(emotions).filter(([k]) => k !== '_id') : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">Deep insights across sentiment, topics, departments and time.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PieChartCard title="Sentiment Distribution" labels={charts.sentimentDistribution.map((s) => s._id)} data={charts.sentimentDistribution.map((s) => s.count)} />
        <PieChartCard title="Priority Distribution" labels={charts.priorityDistribution.map((s) => s._id)} data={charts.priorityDistribution.map((s) => s.count)} />
      </div>

      {dates.length > 0 && <LineChartCard title="Sentiment Trend (30 days)" labels={dates} datasets={sentimentSeries} />}

      <BarChartCard
        title="Department Comparison"
        labels={charts.departmentStats.map((d) => d.code)}
        datasets={[
          { label: 'Total', data: charts.departmentStats.map((d) => d.total) },
          { label: 'Resolved', data: charts.departmentStats.map((d) => d.resolved), color: '#10b981' },
          { label: 'Urgent', data: charts.departmentStats.map((d) => d.urgent), color: '#ef4444' },
        ]}
      />

      {emotionEntries.length > 0 && (
        <RadarChartCard
          title="Aggregate Emotion Profile"
          labels={emotionEntries.map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))}
          data={emotionEntries.map(([, v]) => Number(v) || 0)}
          label="Avg. Intensity"
        />
      )}

      {topics && topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topics.map((t: any) => (
                <div key={t._id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-sm font-medium text-foreground">{t._id}</span>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{t.count} reports</span>
                    <span className="text-emerald-400">{t.positive} positive</span>
                    <span className="text-red-400">{t.negative} negative</span>
                    <span>★ {t.avgRating?.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      <AreaChartCard
        title="Monthly Growth"
        labels={charts.monthlyTrend.map((m) => `${m.month}/${m.year}`)}
        data={charts.monthlyTrend.map((m) => m.total)}
        label="Total Feedback"
      />
    </div>
  );
}
