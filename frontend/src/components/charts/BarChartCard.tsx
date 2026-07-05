import { Bar } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { baseOptions, chartColors } from './ChartSetup';

interface BarChartCardProps {
  title: string;
  labels: string[];
  datasets: { label: string; data: number[]; color?: string }[];
}

export const BarChartCard = ({ title, labels, datasets }: BarChartCardProps) => {
  const palette = [chartColors.indigo, chartColors.emerald, chartColors.pink, chartColors.amber];
  return (
    <Card glow>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar
            data={{
              labels,
              datasets: datasets.map((ds, i) => ({
                label: ds.label,
                data: ds.data,
                backgroundColor: `${ds.color || palette[i % palette.length]}cc`,
                borderRadius: 6,
                maxBarThickness: 32,
              })),
            }}
            options={baseOptions}
          />
        </div>
      </CardContent>
    </Card>
  );
};
