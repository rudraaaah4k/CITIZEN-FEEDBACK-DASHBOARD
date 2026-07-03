import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { AnimatedBackground } from '../../components/shared/AnimatedBackground';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <AnimatedBackground />
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="gradient-text text-8xl font-bold"
      >
        404
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 text-lg text-muted-foreground"
      >
        This page doesn&apos;t exist, or has moved.
      </motion.p>
      <Link to="/" className="mt-8">
        <Button leftIcon={<Home className="h-4 w-4" />}>Back to Home</Button>
      </Link>
    </div>
  );
}
