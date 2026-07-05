import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FileBarChart, Download, Trash2, FileText, FileSpreadsheet, FileJson } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useReports, useGenerateReport, useDownloadReport, useDeleteReport } from '../../hooks/useReports';
import { formatDateTime } from '../../lib/utils';

interface ReportForm {
  name: string;
  type: string;
  format: string;
}

const formatIcon: Record<string, typeof FileText> = { pdf: FileText, excel: FileSpreadsheet, csv: FileJson };

export default function Reports() {
  const { data: reports, isLoading } = useReports();
  const { mutate: generate, isPending: isGenerating } = useGenerateReport();
  const { mutate: download } = useDownloadReport();
  const { mutate: remove } = useDeleteReport();

  const { register, handleSubmit, reset } = useForm<ReportForm>({
    defaultValues: { type: 'feedback_summary', format: 'pdf' },
  });

  const onSubmit = (data: ReportForm) => {
    generate(data, { onSuccess: () => reset({ name: '', type: 'feedback_summary', format: 'pdf' }) });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Generate and export analytical reports.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-4 sm:items-end">
            <Input label="Report Name" placeholder="e.g. Q3 Feedback Summary" {...register('name', { required: true })} />
            <Select
              label="Type"
              options={[
                { label: 'Feedback Summary', value: 'feedback_summary' },
                { label: 'Department Analysis', value: 'department_analysis' },
                { label: 'Sentiment Report', value: 'sentiment_report' },
                { label: 'User Activity', value: 'user_activity' },
              ]}
              {...register('type')}
            />
            <Select
              label="Format"
              options={[
                { label: 'PDF', value: 'pdf' },
                { label: 'Excel', value: 'excel' },
                { label: 'CSV', value: 'csv' },
              ]}
              {...register('format')}
            />
            <Button type="submit" isLoading={isGenerating} leftIcon={<FileBarChart className="h-4 w-4" />}>
              Generate
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        {isLoading ? (
          <div>{Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} />)}</div>
        ) : !reports?.length ? (
          <CardContent>
            <EmptyState icon={FileBarChart} title="No reports yet" description="Generate your first report above." />
          </CardContent>
        ) : (
          <div className="divide-y divide-white/5">
            {reports.map((r, i) => {
              const Icon = formatIcon[r.format] || FileText;
              return (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-xl bg-white/5 p-2.5">
                      <Icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.type.replace('_', ' ')} · {r.recordCount} records · {formatDateTime(r.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        r.status === 'ready'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : r.status === 'failed'
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }
                    >
                      {r.status}
                    </Badge>
                    {r.status === 'ready' && (
                      <Button size="sm" variant="outline" onClick={() => download({ id: r._id, name: r.name, format: r.format })} leftIcon={<Download className="h-3.5 w-3.5" />}>
                        Download
                      </Button>
                    )}
                    <button onClick={() => remove(r._id)} className="text-muted-foreground hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
