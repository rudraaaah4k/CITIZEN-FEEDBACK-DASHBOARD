import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const ProgressBar = ({ value, className, colorClass }: { value: number; className?: string; colorClass?: string }) => (
  <div className={cn('h-2 w-full overflow-hidden rounded-full bg-white/10', className)}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className={cn('h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500', colorClass)}
    />
  </div>
);
