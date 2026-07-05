import { Radar } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { chartColors } from './ChartSetup';

export const RadarChartCard = ({
  title,
  labels,
  data,
  label,
}: {
  title: string;
  labels: string[];
  data: number[];
  label: string;
}) => (
  <Card glow>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64">
        <Radar
          data={{
            labels,
            datasets: [
              {
                label,
                data,
                borderColor: chartColors.purple,
                backgroundColor: `${chartColors.purple}33`,
                pointBackgroundColor: chartColors.purple,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: '#94a3b8' } },
            },
            scales: {
              r: {
                angleLines: { color: 'rgba(255,255,255,0.06)' },
                grid: { color: 'rgba(255,255,255,0.06)' },
                pointLabels: { color: '#94a3b8', font: { size: 11 } },
                ticks: { display: false },
              },
            },
          }}
        />
      </div>
    </CardContent>
  </Card>
);
