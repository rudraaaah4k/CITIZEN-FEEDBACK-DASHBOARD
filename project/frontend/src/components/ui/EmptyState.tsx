import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 py-16 text-center px-6"
  >
    <div className="rounded-2xl bg-white/5 p-4">
      <Icon className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
    {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
    {action}
  </motion.div>
);
