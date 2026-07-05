import { Line } from 'react-chartjs-2';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { baseOptions, chartColors } from './ChartSetup';

export const AreaChartCard = ({
  title,
  labels,
  data,
  label,
  color = chartColors.indigo,
}: {
  title: string;
  labels: string[];
  data: number[];
  label: string;
  color?: string;
}) => (
  <Card glow>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64">
        <Line
          data={{
            labels,
            datasets: [
              {
                label,
                data,
                borderColor: color,
                backgroundColor: `${color}33`,
                fill: true,
                tension: 0.4,
                pointRadius: 2,
              },
            ],
          }}
          options={baseOptions}
        />
      </div>
    </CardContent>
  </Card>
);
