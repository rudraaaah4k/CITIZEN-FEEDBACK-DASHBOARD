import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AnimatedBackground } from '../shared/AnimatedBackground';

export const PublicLayout = () => (
  <div className="min-h-screen">
    <AnimatedBackground />
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);
