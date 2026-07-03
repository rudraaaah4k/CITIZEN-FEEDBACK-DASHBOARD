import { cn } from '../../lib/utils';

export const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'animate-pulse rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-shimmer',
      className
    )}
  />
);

export const CardSkeleton = () => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center gap-4 p-4 border-b border-white/5">
    <Skeleton className="h-10 w-10 rounded-full" />
    <Skeleton className="h-4 flex-1" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-4 w-16" />
  </div>
);
