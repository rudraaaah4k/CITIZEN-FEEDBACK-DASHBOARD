import { Line } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { baseOptions, chartColors } from './ChartSetup';

interface LineChartCardProps {
  title: string;
  labels: string[];
  datasets: { label: string; data: number[]; color?: string }[];
}

export const LineChartCard = ({ title, labels, datasets }: LineChartCardProps) => {
  const palette = [chartColors.indigo, chartColors.pink, chartColors.emerald];
  return (
    <Card glow>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line
            data={{
              labels,
              datasets: datasets.map((ds, i) => ({
                label: ds.label,
                data: ds.data,
                borderColor: ds.color || palette[i % palette.length],
                backgroundColor: `${ds.color || palette[i % palette.length]}22`,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: ds.color || palette[i % palette.length],
              })),
            }}
            options={baseOptions}
          />
        </div>
      </CardContent>
    </Card>
  );
};
