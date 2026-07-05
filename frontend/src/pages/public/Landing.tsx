import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  BrainCircuit,
  ShieldCheck,
  BarChart3,
  Bell,
  MapPin,
  ImagePlus,
  Smile,
  Frown,
  Meh,
  ChevronDown,
  Star,
  Building2,
  Users,
  MessageSquareText,
  Zap,
  Lock,
  FileBarChart,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScrollReveal } from '../../components/shared/ScrollReveal';
import { AnimatedCounter } from '../../components/shared/AnimatedCounter';

const TYPING_WORDS = ['Pothole on 5th Avenue needs urgent repair', 'Streetlight outage near the school', 'Water leakage flooding the sidewalk', 'Excellent response from sanitation team!'];

function useTypingEffect(words: string[], speed = 45, pause = 1800) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), speed);
    } else if (!deleting && text.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), speed / 2);
    } else {
      setDeleting(false);
      setWordIndex((i) => i + 1);
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, words, speed, pause]);

  return text;
}

const stats = [
  { label: 'Feedback Analyzed', value: 48250, suffix: '+' },
  { label: 'Avg. Resolution Time', value: 36, suffix: 'h' },
  { label: 'Citizen Satisfaction', value: 94, suffix: '%' },
  { label: 'Departments Connected', value: 27, suffix: '' },
];

const features = [
  {
    icon: BrainCircuit,
    title: 'AI Sentiment Engine',
    desc: 'Free, rule-based NLP instantly classifies sentiment, emotion, urgency and spam — no API keys, no cost.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    desc: 'Pie, bar, line, area, radar charts and heatmaps update live as new feedback rolls in.',
  },
  {
    icon: MapPin,
    title: 'Location-Aware Reports',
    desc: 'Citizens attach location, priority, and department so issues route to the right team instantly.',
  },
  {
    icon: ImagePlus,
    title: 'Rich Attachments',
    desc: 'Upload photos and PDFs as evidence — securely stored and linked to every complaint.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    desc: 'Automatic status updates keep citizens informed from submission to resolution.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    desc: 'JWT + refresh tokens secure citizen, moderator, department-head and admin roles separately.',
  },
];

const steps = [
  { title: 'Submit Feedback', desc: 'Citizens describe an issue, pick a department & category, attach evidence, and optionally stay anonymous.' },
  { title: 'AI Analyzes Instantly', desc: 'Our free NLP engine detects sentiment, emotion, urgency, spam and topic in milliseconds.' },
  { title: 'Routed to Department', desc: 'Feedback is prioritized and routed automatically based on urgency and category.' },
  { title: 'Resolved & Reported', desc: 'Admins track, resolve, and export reports — citizens get notified at every step.' },
];

const testimonials = [
  { name: 'Maria Chen', role: 'City Council Member', text: 'CivicPulse cut our complaint triage time by more than half. The sentiment dashboard is a game changer for prioritizing what matters.' },
  { name: 'David Okafor', role: 'Sanitation Dept. Head', text: 'We finally see trends instead of a flood of individual tickets. The AI keyword extraction is scarily accurate.' },
  { name: 'Priya Nair', role: 'Citizen', text: 'I submitted a streetlight complaint and could track every status change. Transparent and fast.' },
];

const faqs = [
  { q: 'Is the AI analysis free to run?', a: 'Yes. CivicPulse uses a rule-based NLP engine built on the open-source "natural" library — no paid API keys or external AI services are required.' },
  { q: 'Can citizens submit feedback anonymously?', a: 'Absolutely. Anonymous mode hides the submitter identity from public views while still letting admins manage the complaint.' },
  { q: 'What file types can be attached?', a: 'Citizens can upload images (JPG, PNG, WEBP) and PDF documents as supporting evidence for their feedback.' },
  { q: 'How are complaints prioritized?', a: 'Priority is a combination of the citizen-selected priority and the AI-computed urgency score, so critical issues surface first.' },
  { q: 'Can I export analytics data?', a: 'Yes, admins can export feedback and reports as PDF, Excel, or CSV directly from the dashboard.' },
];

export default function Landing() {
  const typedText = useTypingEffect(TYPING_WORDS);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative flex min-h-screen items-center px-4 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5" /> AI-Powered Civic Engagement Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Understand what your <span className="gradient-text">citizens really feel</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg text-muted-foreground"
            >
              CivicPulse collects, analyzes, and routes citizen feedback with free AI — sentiment, urgency, and topic
              detection built in. No placeholders. Just a real, working dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 h-8 font-mono text-sm text-indigo-300"
            >
              <span className="text-muted-foreground">“</span>
              {typedText}
              <span className="animate-pulse">|</span>
              <span className="text-muted-foreground">”</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link to="/register">
                <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Get Started Free
                </Button>
              </Link>
              <Link to="/track">
                <Button size="lg" variant="glass">
                  Track a Complaint
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-foreground sm:text-3xl">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Interactive dashboard preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Live Dashboard</p>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Pending', value: 128, color: 'text-amber-400' },
                  { label: 'Resolved', value: 942, color: 'text-emerald-400' },
                  { label: 'Urgent', value: 14, color: 'text-red-400' },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
                    <p className="text-[11px] text-muted-foreground">{k.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  { icon: Smile, label: 'Positive', width: '62%', color: 'bg-emerald-500' },
                  { icon: Meh, label: 'Neutral', width: '24%', color: 'bg-slate-400' },
                  { icon: Frown, label: 'Negative', width: '14%', color: 'bg-red-500' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-2">
                    <row.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="w-14 text-xs text-muted-foreground">{row.label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: row.width }}
                        transition={{ duration: 1.2, delay: 0.5 }}
                        className={`h-full rounded-full ${row.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-indigo-300">
                  <BrainCircuit className="h-3.5 w-3.5" /> AI Insight
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Spike detected in "Water Supply" complaints — urgency +18% this week.
                </p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-8 -left-8 hidden rounded-xl border border-white/10 bg-white/[0.05] p-4 shadow-xl backdrop-blur-xl sm:block"
            >
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-foreground">4.8 / 5</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Avg. Citizen Rating</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Everything a modern civic platform needs</h2>
            <p className="mt-4 text-muted-foreground">
              From submission to resolution, every step is instrumented, analyzed, and beautifully visualized.
            </p>
          </ScrollReveal>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 0.07}>
                <Card hover glow className="h-full p-6">
                  <div className="inline-flex rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 p-3">
                    <f.icon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">How it works</h2>
            <p className="mt-4 text-muted-foreground">From a citizen's report to a resolved issue in four simple steps.</p>
          </ScrollReveal>

          <div className="mt-16 grid gap-8 md:grid-cols-4">
            {steps.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 0.1} className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/25">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI DEMO */}
      <section id="ai-demo" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <ScrollReveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-purple-300">
                <BrainCircuit className="h-3.5 w-3.5" /> AI Analysis Demo
              </span>
              <h2 className="mt-6 text-3xl font-bold text-foreground sm:text-4xl">
                Every submission is analyzed <span className="gradient-text">in real time</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Our free NLP engine runs sentiment analysis, emotion detection, keyword extraction, topic
                classification, spam and urgency detection, and language detection — all without any paid API.
              </p>
              <ul className="mt-6 space-y-3">
                {['Sentiment: Positive / Negative / Neutral', 'Emotion breakdown across 6 dimensions', 'Automatic keyword & topic extraction', 'Spam & urgency scoring for smart triage'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4 text-indigo-400" /> {item}
                    </li>
                  )
                )}
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <Card glow className="p-6">
                <p className="text-xs font-medium text-muted-foreground">Sample Feedback</p>
                <p className="mt-2 rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm text-foreground">
                  "The water pipeline near Elm Street has been leaking for 3 days, flooding the road. This is urgent
                  and dangerous for pedestrians!"
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                    <p className="text-xs text-muted-foreground">Sentiment</p>
                    <p className="mt-1 text-sm font-semibold text-red-400">Negative (-0.72)</p>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                    <p className="text-xs text-muted-foreground">Urgency</p>
                    <p className="mt-1 text-sm font-semibold text-amber-400">High (0.89)</p>
                  </div>
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
                    <p className="text-xs text-muted-foreground">Topic</p>
                    <p className="mt-1 text-sm font-semibold text-indigo-400">Water Supply</p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-xs text-muted-foreground">Spam Score</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-400">0.02 (Clean)</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['leak', 'water', 'urgent', 'flooding', 'pipeline'].map((k) => (
                    <span key={k} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
                      #{k}
                    </span>
                  ))}
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Trusted by teams and citizens alike</h2>
          </ScrollReveal>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 0.1}>
                <Card className="h-full p-6">
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">"{t.text}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-semibold text-white">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Frequently asked questions</h2>
          </ScrollReveal>
          <div className="mt-12 space-y-3">
            {faqs.map((f, i) => (
              <ScrollReveal key={f.q} delay={i * 0.05}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between p-5 text-left"
                  >
                    <span className="font-medium text-foreground">{f.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }}>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 p-12 text-center backdrop-blur-xl">
            <div className="absolute inset-0 aurora-bg opacity-40" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Ready to modernize civic feedback?</h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Join CivicPulse and give every citizen voice a data-driven response.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap justify-center gap-8 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" /> JWT Secured
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Multi-department
                </span>
                <span className="flex items-center gap-1.5">
                  <FileBarChart className="h-3.5 w-3.5" /> Exportable Reports
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Role-based Access
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
