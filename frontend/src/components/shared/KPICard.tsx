import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { AnimatedCounter } from './AnimatedCounter';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  suffix?: string;
  change?: number;
  colorClass?: string;
}

export const KPICard = ({ label, value, icon: Icon, suffix = '', change, colorClass = 'from-indigo-500 to-purple-600' }: KPICardProps) => {
  return (
    <Card hover glow className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            <AnimatedCounter value={value} suffix={suffix} />
          </p>
          {change !== undefined && (
            <div
              className={cn(
                'mt-2 inline-flex items-center gap-1 text-xs font-medium',
                change >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(change)}% this month
            </div>
          )}
        </div>
        <div className={cn('rounded-xl bg-gradient-to-br p-3 shadow-lg', colorClass)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </Card>
  );
};
