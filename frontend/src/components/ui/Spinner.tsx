import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Spinner = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <Loader2 className={cn('animate-spin text-indigo-400', className)} size={size} />
);

export const FullPageSpinner = () => (
  <div className="flex min-h-[60vh] w-full items-center justify-center">
    <Spinner size={36} />
  </div>
);
