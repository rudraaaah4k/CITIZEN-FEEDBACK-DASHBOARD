import React from 'react';
import { motion } from 'framer-motion';

export const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    {children}
  </motion.div>
);
