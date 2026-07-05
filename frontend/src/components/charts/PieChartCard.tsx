import { Pie } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { chartColors } from './ChartSetup';

interface PieChartCardProps {
  title: string;
  labels: string[];
  data: number[];
  colors?: string[];
}

export const PieChartCard = ({ title, labels, data, colors }: PieChartCardProps) => {
  const palette = colors || [chartColors.indigo, chartColors.emerald, chartColors.red, chartColors.amber, chartColors.purple, chartColors.blue];

  return (
    <Card glow>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Pie
            data={{
              labels,
              datasets: [
                {
                  data,
                  backgroundColor: palette.map((c) => `${c}cc`),
                  borderColor: 'rgba(15,23,42,1)',
                  borderWidth: 2,
                  hoverOffset: 8,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', usePointStyle: true, padding: 14, font: { size: 11 } } },
                tooltip: {
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  titleColor: '#f1f5f9',
                  bodyColor: '#cbd5e1',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderWidth: 1,
                  padding: 12,
                  cornerRadius: 12,
                },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
