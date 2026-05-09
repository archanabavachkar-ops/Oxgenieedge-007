
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Zap, Workflow, PhoneCall, CheckCircle2, ChevronRight, X, 
  BarChart3, Layers, Building2, Building, ShieldCheck, Lock, Activity, 
  TrendingUp, Users2, Database, MessageSquare, ArrowRight, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.jsx';

const PAIN_POINTS = [
  { icon: Layers, title: "Too many disconnected tools", desc: "Juggling 5 different apps just to manage a single prospect journey." },
  { icon: Zap, title: "Missed follow-ups and leads", desc: "Opportunities slipping through the cracks because no one called them back in time." },
  { icon: Clock, title: "Manual operations drain time", desc: "Spending hours updating CRM fields, sending emails, and scheduling tasks." },
  { icon: BarChart3, title: "No real-time visibility", desc: "Flying blind on conversion rates and agent performance until end-of-month." }
];

function Clock(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: Database,
    title: "Smart CRM Engine",
    desc: "A centralized nervous system that logs every interaction, scores leads, and maintains perfect context for your entire team.",
    colSpan: "col-span-1 md:col-span-2",
    glow: "glow-orange-sm"
  },
  {
    icon: Workflow,
    title: "AI Automation Engine",
    desc: "Visual workflow builder to automate data entry, follow-ups, and notifications without writing code.",
    colSpan: "col-span-1",
    glow: ""
  },
  {
    icon: PhoneCall,
    title: "AI Voice Agent",
    desc: "Inbound and outbound voice capabilities. Qualify leads, book meetings, and answer FAQs 24/7.",
    colSpan: "col-span-1",
    glow: ""
  },
  {
    icon: TrendingUp,
    title: "Decision Intelligence Dashboard",
    desc: "Real-time analytics that don't just report the past, but predict which leads will close and suggest next actions.",
    colSpan: "col-span-1 md:col-span-2",
    glow: "glow-orange-sm"
  }
];

const STEPS = [
  { title: "Connect Lead Sources", desc: "Plug in Facebook, Website, Google Ads, or custom webhooks in 2 clicks.", icon: Building },
  { title: "AI Organizes & Assigns", desc: "Leads are instantly scored, tagged, and routed to the right team or workflow.", icon: Bot },
  { title: "AI Follows Up Automatically", desc: "Voice, SMS, and Email outreach happens instantly while leads are hot.", icon: MessageSquare },
  { title: "You Close More Deals", desc: "Your team only talks to highly qualified prospects ready to buy.", icon: TrendingUp }
];

const USE_CASES = [
  { title: "Real Estate", desc: "Qualify property inquiries instantly and schedule viewings automatically.", icon: Building2 },
  { title: "Agencies", desc: "Automate onboarding and maintain constant communication with clients.", icon: Users2 },
  { title: "Healthcare", desc: "Securely manage patient inquiries and automate appointment scheduling.", icon: Activity },
  { title: "Coaching", desc: "Filter unqualified leads and ensure your calendar stays full of high-ticket prospects.", icon: TrendingUp },
  { title: "Local Businesses", desc: "Never miss a phone call. The AI answers, books, and logs everything.", icon: Building }
];

const PRICING = [
  {
    name: "Starter",
    price: "₹4,999",
    period: "/month",
    desc: "For small teams starting their automation journey.",
    features: ["Smart CRM Access", "Basic Automation Workflows", "Email & SMS Integration", "Up to 1,000 Leads/mo", "Standard Support"],
    highlight: false
  },
  {
    name: "Growth",
    price: "₹12,999",
    period: "/month",
    desc: "For scaling businesses that need AI voice capabilities.",
    features: ["Everything in Starter", "AI Voice Agent (500 mins)", "Advanced Routing Rules", "Unlimited Workflows", "Up to 10,000 Leads/mo", "Priority Support"],
    highlight: true
  },
  {
    name: "Scale",
    price: "₹29,999",
    period: "/month",
    desc: "For high-volume operations requiring custom intelligence.",
    features: ["Everything in Growth", "AI Voice Agent (2000 mins)", "Custom AI Intent Training", "Dedicated Account Manager", "Unlimited Leads", "24/7 SLA Support"],
    highlight: false
  }
];

const COMPARISON = [
  { feature: "Speed to Lead", traditional: "Hours to Days", ai: "Under 5 Seconds" },
  { feature: "Availability", traditional: "9 to 5, Weekdays", ai: "24/7/365" },
  { feature: "Data Entry", traditional: "Manual, Error-Prone", ai: "100% Automated" },
  { feature: "Lead Qualification", traditional: "Human Judgment", ai: "Predictive AI Scoring" },
  { feature: "Scalability", traditional: "Hire more staff", ai: "Instant software scaling" }
];

const TESTIMONIALS = [
  { name: "Raj Patel", title: "Founder", company: "Meridian Labs", quote: "Our sales cycle dropped from 14 days to 3. The AI handles the initial qualification flawlessly.", metric: "360% ROI in Month 1" },
  { name: "Maya Chen", title: "Operations Director", company: "Coastal Roasters", quote: "I used to spend my weekends fixing CRM errors. Now I trust the system to run itself.", metric: "Saved 24 hrs/week" },
  { name: "Anika Bergström", title: "CEO", company: "Elm & Oak", quote: "The AI voice agent booked 14 consultations while we were asleep. It's a fundamental game changer.", metric: "42% Increase in Bookings" }
];

const FAQS = [
  { question: "How long does setup take?", answer: "Most businesses are fully operational within 48 hours. Our onboarding team assists you with connecting your lead sources and mapping your first workflows." },
  { question: "Do I need technical knowledge?", answer: "No. The system is designed with visual builders and plain-text AI instructions. If you can write an email, you can configure your AI Chief of Staff." },
  { question: "Can it replace my entire team?", answer: "It replaces manual tasks, not human relationships. Your team will stop doing data entry and cold calling, and start focusing purely on closing deals and building relationships." },
  { question: "What integrations are supported?", answer: "We support native integrations for Facebook Lead Ads, Google Ads, major website builders, plus open webhooks and Zapier connectivity for everything else." },
  { question: "How is my data protected?", answer: "We utilize AES-256 encryption, SOC2-compliant infrastructure, and strict role-based access controls. Your data is isolated and never used to train global models." },
  { question: "What's the ROI timeline?", answer: "Most clients see positive ROI within the first 30 days due to the immediate recovery of previously leaked leads and the reduction in manual labor hours." }
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function OxgenieEdgeLandingPage() {
  const [demoStep, setDemoStep] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden selection:bg-primary/30">
      <Helmet>
        <title>Oxgenie Edge | Your AI Chief of Staff</title>
        <meta name="description" content="Automate decisions, manage operations, and grow faster with one intelligent system." />
      </Helmet>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-gradient-orange flex items-center justify-center shadow-glow-orange-sm hover-lift">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">Oxgenie<span className="text-primary">Edge</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-smooth">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-smooth">How it Works</a>
            <a href="#pricing" className="hover:text-primary transition-smooth">Pricing</a>
            <a href="#faq" className="hover:text-primary transition-smooth">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-smooth hidden sm:block">Log in</Link>
            <Button className="btn-orange font-semibold">
              Book Demo
            </Button>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[100dvh] flex items-center justify-center pt-16 overflow-hidden">
        {/* Atmospheric Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1683881019574-1fcbead20f01')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background"></div>
        
        {/* Orange Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse-glow"></div>
        
        {/* Tech Grid Overlay */}
        <div className="absolute inset-0 tech-grid opacity-30"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-5xl mx-auto space-y-10">
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-primary/20 text-primary text-sm font-medium mb-6 shadow-glow-orange-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Oxgenie Edge 2.0 is Live
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="heading-xl text-balance leading-[1.05] mb-8">
              Your AI Chief of Staff — <br className="hidden md:block"/> 
              <span className="text-gradient-orange">Runs Your Business</span> While You Scale
            </motion.h1>
            
            <motion.p variants={fadeIn} className="body-lg text-muted-foreground max-w-3xl mx-auto mb-10">
              Automate decisions, manage operations, and grow faster with one intelligent system. Stop working in your business, start working on it.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <Button size="lg" className="btn-orange w-full sm:w-auto h-16 px-10 font-bold text-lg rounded-xl hover-lift group">
                Start Free Setup 
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="btn-glass w-full sm:w-auto h-16 px-10 font-semibold text-lg rounded-xl hover-lift">
                <Play className="mr-2 h-5 w-5" /> Watch Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </section>

      {/* 2. PROBLEM SECTION */}
      <section className="section-spacing relative">
        <div className="container-premium">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-20">
            <h2 className="heading-lg mb-6">The Operations Bottleneck</h2>
            <p className="body-lg text-muted-foreground max-w-3xl mx-auto">
              You are the bottleneck. Your business can only grow as fast as your capacity to manage it.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PAIN_POINTS.map((point, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} transition={{ delay: i * 0.1 }}>
                <Card className="card-glass h-full hover:border-destructive/30 transition-all duration-500 hover-lift group">
                  <CardContent className="p-8 text-center md:text-left">
                    <div className="h-14 w-14 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-8 mx-auto md:mx-0 group-hover:scale-110 transition-transform">
                      <point.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{point.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{point.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SOLUTION / VISUAL HUB */}
      <section className="section-spacing relative overflow-hidden bg-white/[0.01] border-y border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/15 blur-[180px] rounded-full pointer-events-none"></div>
        
        <div className="container-premium relative z-10">
          <div className="text-center mb-20">
            <h2 className="heading-lg mb-6">Meet Your AI Chief of Staff</h2>
            <p className="body-lg text-muted-foreground max-w-3xl mx-auto">
              One unified intelligence layer connecting every aspect of your revenue operations.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto aspect-square md:aspect-[21/9] flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[140px] h-[140px] rounded-2xl glass-card border border-primary/50 flex items-center justify-center glow-orange z-20 relative hover-lift">
                <Bot className="h-14 w-14 text-primary" />
              </div>
              
              {[
                { icon: Database, label: "CRM", pos: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" },
                { icon: PhoneCall, label: "Voice AI", pos: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" },
                { icon: Workflow, label: "Automations", pos: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2" },
                { icon: BarChart3, label: "Analytics", pos: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2" },
              ].map((node, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className={`absolute ${node.pos} w-[100px] h-[100px] rounded-xl glass-card border border-white/10 flex flex-col items-center justify-center gap-2 z-10 hover-lift tech-glow`}
                >
                  <node.icon className="h-7 w-7 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">{node.label}</span>
                </motion.div>
              ))}
              
              <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block opacity-20" style={{ zIndex: 5 }}>
                <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="50%" y1="50%" x2="15%" y2="50%" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="50%" y1="50%" x2="85%" y2="50%" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES BENTO GRID */}
      <section id="features" className="section-spacing">
        <div className="container-premium">
          <div className="mb-20">
            <h2 className="heading-lg mb-4 text-balance">Built for Speed and Scale</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <motion.div 
                key={i} 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} 
                className={`${feature.colSpan} h-full`}
              >
                <div className={`h-full rounded-3xl p-10 flex flex-col justify-between card-glass ${feature.glow} group hover-lift tech-glow`}>
                  <div>
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="section-spacing bg-white/[0.01] border-y border-white/5 relative">
        <div className="container-premium">
          <div className="text-center mb-24">
            <h2 className="heading-lg mb-4">How the Engine Runs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            <div className="hidden md:block absolute top-14 left-[10%] right-[10%] h-px bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0"></div>

            {STEPS.map((step, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} transition={{ delay: i * 0.15 }} className="relative text-center">
                <div className="h-28 w-28 mx-auto glass-card border border-white/10 rounded-full flex items-center justify-center relative z-10 mb-8 shadow-premium hover-lift ambient-orange">
                  <div className="absolute inset-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-gradient-orange text-white font-bold flex items-center justify-center shadow-glow-orange-sm">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE DEMO SEQUENCE */}
      <section className="section-spacing overflow-hidden">
        <div className="container-premium">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="heading-lg mb-8">See it in Action</h2>
              <p className="body-lg text-muted-foreground mb-12">
                Watch how Oxgenie Edge processes a new lead instantly, completely hands-free.
              </p>
              
              <div className="space-y-5">
                {['Lead Captured via Facebook Ads', 'AI Assigns to Sales Team', 'Voice AI Makes Introduction Call', 'Meeting Booked & CRM Updated'].map((label, idx) => (
                  <div key={idx} className={`p-5 rounded-xl border transition-all duration-500 flex items-center gap-4 ${demoStep === idx ? 'glass-card border-primary shadow-glow-orange-sm' : 'bg-card/20 border-white/5 opacity-50'}`}>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${demoStep === idx ? 'bg-gradient-orange text-white shadow-glow-orange-sm' : 'bg-white/10 text-white'}`}>
                      {demoStep > idx ? <CheckCircle2 className="h-6 w-6" /> : idx + 1}
                    </div>
                    <span className="font-medium text-lg">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[550px] w-full rounded-2xl card-glass overflow-hidden flex flex-col shadow-premium">
              <div className="h-14 bg-white/5 border-b border-white/10 flex items-center px-6 gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-muted-foreground font-mono ml-4">System Log</div>
              </div>
              <div className="flex-1 p-8 font-mono text-sm space-y-5 overflow-hidden relative">
                <AnimatePresence mode="popLayout">
                  {demoStep >= 0 && (
                    <motion.div key="step0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-slate-300">
                      <span className="text-green-400 font-bold">[20:41:02]</span> SYSTEM: New Lead Payload Received <br/>
                      <span className="text-muted-foreground">{"{ name: 'John Doe', source: 'FB_Ads', intent: 'High' }"}</span>
                    </motion.div>
                  )}
                  {demoStep >= 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-slate-300">
                      <span className="text-green-400 font-bold">[20:41:03]</span> AI_ENGINE: Lead Scored (92/100). Assigned to Sales Group A.
                    </motion.div>
                  )}
                  {demoStep >= 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-slate-300">
                      <span className="text-primary font-bold">[20:41:05]</span> VOICE_AGENT: Initiating Outbound Call... <br/>
                      <span className="text-muted-foreground">Status: Connected. Duration: 02m 14s.</span>
                    </motion.div>
                  )}
                  {demoStep >= 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-primary font-bold">
                      <span className="text-green-400">[20:43:20]</span> CRM: Meeting Scheduled for Tomorrow 10:00 AM. Record Updated.
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-card to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. USE CASES */}
      <section className="section-spacing bg-white/[0.01] border-y border-white/5">
        <div className="container-premium">
          <div className="text-center mb-20">
            <h2 className="heading-lg mb-6">Built for Your Industry</h2>
            <p className="body-lg text-muted-foreground">Pre-configured workflows tailored to your specific business model.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {USE_CASES.map((uc, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} transition={{ delay: i * 0.1 }} className="flex-1 min-w-[280px] max-w-[350px]">
                <Card className="card-glass h-full hover:border-primary/30 transition-all duration-500 cursor-default hover-lift tech-glow">
                  <CardContent className="p-8">
                    <uc.icon className="h-10 w-10 text-primary mb-6" />
                    <h3 className="text-xl font-bold mb-3">{uc.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{uc.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. COMPARISON TABLE */}
      <section className="section-spacing">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="heading-lg mb-4">The Evolution of Operations</h2>
          </div>

          <div className="card-glass rounded-3xl overflow-hidden shadow-premium">
            <div className="grid grid-cols-3 bg-white/5 border-b border-white/10 p-8">
              <div className="font-bold text-xl">Capability</div>
              <div className="font-bold text-xl text-muted-foreground">Traditional CRM</div>
              <div className="font-bold text-xl text-primary">Oxgenie Edge</div>
            </div>
            <div className="divide-y divide-white/5">
              {COMPARISON.map((row, i) => (
                <div key={i} className="grid grid-cols-3 p-8 items-center hover:bg-white/[0.02] transition-colors">
                  <div className="font-medium text-lg">{row.feature}</div>
                  <div className="text-muted-foreground flex items-center gap-3">
                    <X className="h-5 w-5 text-destructive opacity-70" /> {row.traditional}
                  </div>
                  <div className="text-foreground font-semibold flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" /> {row.ai}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS */}
      <section className="section-spacing bg-white/[0.01] border-y border-white/5">
        <div className="container-premium">
          <div className="text-center mb-20">
            <h2 className="heading-lg mb-4">Trusted by Ambitious Teams</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} transition={{ delay: i * 0.1 }}>
                <Card className="card-glass h-full relative overflow-hidden hover-lift">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z"/></svg>
                  </div>
                  <CardContent className="p-10 flex flex-col h-full relative z-10">
                    <p className="text-lg leading-relaxed mb-10 flex-1">"{t.quote}"</p>
                    <div className="border-t border-white/10 pt-8">
                      <div className="font-bold text-primary mb-2 text-lg">{t.metric}</div>
                      <div className="font-semibold text-lg">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.title}, {t.company}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PRICING */}
      <section id="pricing" className="section-spacing">
        <div className="container-premium">
          <div className="text-center mb-20">
            <h2 className="heading-lg mb-6">Simple, Transparent Pricing</h2>
            <p className="body-lg text-muted-foreground">Scale your operations without scaling your headcount.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {PRICING.map((plan, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} transition={{ delay: i * 0.1 }}>
                <Card className={`relative h-full flex flex-col ${plan.highlight ? 'card-glass glow-orange scale-105 border-primary/50' : 'card-glass border-white/5'} hover-lift`}>
                  {plan.highlight && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-orange text-white px-6 py-2 rounded-full text-sm font-bold shadow-glow-orange-sm">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="p-10 flex flex-col h-full">
                    <h3 className="text-2xl font-bold mb-3">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-8 h-12">{plan.desc}</p>
                    <div className="mb-10">
                      <span className="text-5xl font-bold font-heading">{plan.price}</span>
                      <span className="text-muted-foreground text-lg">{plan.period}</span>
                    </div>
                    
                    <ul className="space-y-5 mb-10 flex-1">
                      {plan.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                          <span className="text-sm">{f}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button className={`w-full h-14 font-bold text-lg rounded-xl ${plan.highlight ? 'btn-orange' : 'btn-glass'} hover-lift`}>
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. TRUST & SECURITY */}
      <section className="py-20 bg-white/[0.01] border-y border-white/5">
        <div className="container-premium">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-8">
              <ShieldCheck className="h-12 w-12 mx-auto text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4">Secure Infrastructure</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">SOC2-compliant architecture with end-to-end encryption for all data at rest and in transit.</p>
            </div>
            <div className="p-8">
              <Lock className="h-12 w-12 mx-auto text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4">Data Privacy First</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Your operational data is isolated. We never use your proprietary data to train global models.</p>
            </div>
            <div className="p-8">
              <Activity className="h-12 w-12 mx-auto text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4">99.9% Uptime Guarantee</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Enterprise-grade reliability ensuring your AI Chief of Staff never calls in sick.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FAQ */}
      <section id="faq" className="section-spacing">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="heading-lg">Frequently Asked Questions</h2>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-5">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="card-glass border border-white/5 rounded-2xl px-8">
                <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline py-8">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-8 text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 13. FINAL CTA */}
      <section className="section-spacing relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-orange opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="heading-lg mb-8">Let Your AI Run Operations While You Focus on Growth</h2>
          <p className="body-lg text-muted-foreground mb-12">Join 500+ businesses automating their operations with Oxgenie Edge.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Button size="lg" className="btn-orange h-16 px-10 font-bold text-lg rounded-xl hover-lift">
              Start Free Setup
            </Button>
            <Button size="lg" variant="outline" className="btn-glass h-16 px-10 font-semibold text-lg rounded-xl hover-lift">
              Book a Strategy Call
            </Button>
          </div>
        </div>
      </section>

      {/* 14. FOOTER */}
      <footer className="border-t border-white/10 bg-background pt-20 pb-10">
        <div className="container-premium">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
            <div className="flex items-center gap-2">
              <Bot className="h-7 w-7 text-primary" />
              <span className="font-heading font-bold text-2xl">Oxgenie<span className="text-primary">Edge</span></span>
            </div>
            
            <div className="flex gap-10 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-smooth">Product</a>
              <a href="#pricing" className="hover:text-primary transition-smooth">Pricing</a>
              <a href="#" className="hover:text-primary transition-smooth">Blog</a>
              <a href="#" className="hover:text-primary transition-smooth">Contact</a>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Oxgenie Edge. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-smooth">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-smooth">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
