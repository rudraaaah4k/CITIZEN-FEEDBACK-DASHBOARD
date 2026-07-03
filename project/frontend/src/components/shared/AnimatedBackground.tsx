import { motion } from 'framer-motion';

export const AnimatedBackground = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 mesh-gradient" />
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    />
    <motion.div
      animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-[100px]"
    />
    <motion.div
      animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-purple-600/20 blur-[110px]"
    />
    <motion.div
      animate={{ y: [0, -20, 0], x: [0, 30, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-pink-600/15 blur-[100px]"
    />
  </div>
);
