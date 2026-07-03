import { Link } from 'react-router-dom';
import { MessageSquareText, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'AI Analysis', href: '#ai-demo' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', href: '/login' },
      { label: 'Register', href: '/register' },
      { label: 'Track Complaint', href: '/track' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  },
];

export const Footer = () => (
  <footer className="relative border-t border-white/5 bg-slate-950/60 backdrop-blur-xl">
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
            <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5">
              <MessageSquareText className="h-5 w-5 text-white" />
            </div>
            CivicPulse
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            AI-powered citizen feedback analysis for smarter, more responsive local governance.
          </p>
          <div className="mt-6 flex gap-3">
            {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="rounded-lg border border-white/10 p-2 text-muted-foreground transition-colors hover:border-indigo-500/40 hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 border-t border-white/5 pt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CivicPulse. Built as a Citizen Feedback Analysis Dashboard portfolio project.
      </div>
    </div>
  </footer>
);
