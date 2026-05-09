import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  CheckCircle2, 
  X, 
  TrendingUp, 
  Search, 
  FileX, 
  Ban, 
  BarChart, 
  ArrowRight,
  Menu,
  PhoneCall,
  CalendarClock
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion.jsx';

// Utility component for animated numbers
const AnimatedNumber = ({ value, prefix = "", suffix = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return prefix + Math.round(latest).toLocaleString('en-IN') + suffix;
  });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, { duration: 2, ease: "easeOut" });
      return controls.stop;
    }
  }, [isInView, value, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
};

const PricingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pricingRef = useRef(null);

  // Scarcity Date Calculation
  const nextSlot = new Date();
  nextSlot.setDate(nextSlot.getDate() + 7);
  const formattedDate = nextSlot.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Handle Scroll for Sticky Header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary">
      <Helmet>
        <title>Simple Pricing. Real Business Growth. | OxgenieEdge</title>
        <meta name="description" content="Choose the right AI automation, lead generation, and CRM system to scale your operations and increase revenue. View our pricing plans." />
        <meta name="keywords" content="AI automation, lead generation, CRM automation, digital growth, pricing" />
      </Helmet>

      {/* STICKY HEADER */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass-effect py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform transition-transform group-hover:scale-105 shadow-md">
              <span className="text-white font-bold text-xl">O</span>
            </div>
            <span className={`text-xl font-bold tracking-tight ${isScrolled ? 'text-foreground' : 'text-white'}`}>OxgenieEdge</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`text-sm font-medium hover:text-primary transition-colors ${isScrolled ? 'text-muted-foreground' : 'text-white/80'}`}>Home</Link>
            <Link to="/pricing" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-primary' : 'text-white'}`}>Pricing</Link>
            <Link to="/contact" className={`text-sm font-medium hover:text-primary transition-colors ${isScrolled ? 'text-muted-foreground' : 'text-white/80'}`}>Contact</Link>
            <Button className="rounded-full shadow-lg hover:shadow-xl transition-all" size="sm" onClick={() => navigate('/contact')}>
              <PhoneCall className="w-4 h-4 mr-2" />
              Get Free Strategy Call
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className={`md:hidden p-2 rounded-md ${isScrolled ? 'text-foreground' : 'text-white'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden glass-effect border-t mt-3 absolute w-full"
          >
            <div className="flex flex-col px-4 py-6 space-y-4">
              <Link to="/" className="text-foreground font-medium p-2 hover:bg-muted rounded-md">Home</Link>
              <Link to="/pricing" className="text-primary font-medium p-2 bg-primary/5 rounded-md">Pricing</Link>
              <Link to="/contact" className="text-foreground font-medium p-2 hover:bg-muted rounded-md">Contact</Link>
              <Button className="w-full justify-center mt-4" onClick={() => navigate('/contact')}>Get Free Strategy Call</Button>
            </div>
          </motion.div>
        )}
      </header>

      {/* URGENCY/SCARCITY BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed top-0 left-0 w-full z-40 mt-[72px] md:mt-[80px]"
      >
        <div className="bg-primary text-white text-center py-2 px-4 text-sm font-medium shadow-md flex items-center justify-center space-x-2 animate-in slide-in-from-top-4">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <span>We only onboard 5 new clients per month to maintain quality. Next onboarding slot: <strong className="underline decoration-white/50 underline-offset-2">{formattedDate}</strong></span>
        </div>
      </motion.div>

      <main className="pt-[110px] md:pt-[120px]">
        {/* HERO SECTION */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1703355685639-d558d1b0f63e?q=80&w=2070&auto=format&fit=crop" 
              alt="Business Growth and Strategy" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background/95"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-32">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              Simple Pricing. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Real Business Growth.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Choose the right AI-powered system to scale your leads, automate operations, and increase revenue predictability.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl shadow-lg shadow-primary/20 group" onClick={() => navigate('/contact')}>
                Get Free Strategy Call
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={scrollToPricing}
                className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                View Plans
              </Button>
            </motion.div>
          </div>
        </section>

        {/* PRICING PLANS SECTION */}
        <section ref={pricingRef} className="py-24 bg-background relative -mt-10 rounded-t-[3rem] z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Transparent Plans for Every Stage</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                No hidden fees. Just clear, value-driven systems designed to deliver massive ROI for your business.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {/* PLAN 1 - Starter */}
              <motion.div 
                whileHover={{ y: -8 }}
                className="flex flex-col h-full bg-card rounded-3xl p-8 border border-border shadow-sm"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Starter Growth System</h3>
                  <p className="text-muted-foreground text-sm h-10">Best for new businesses generating ₹0–5L/month.</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold tracking-tight">₹15,000–25,000</span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>
                </div>
                
                <div className="space-y-6 mb-8 flex-grow">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">Features Included</h4>
                    <ul className="space-y-3">
                      {['Lead generation setup', 'Basic website optimization', 'CRM integration (basic)', 'Monthly performance tracking'].map((f, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle2 className="w-5 h-5 text-primary mr-3 shrink-0" />
                          <span className="text-sm text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">Expected Outcomes</h4>
                    <ul className="space-y-3">
                      {['Generate consistent leads', 'Build strong digital presence'].map((f, i) => (
                        <li key={i} className="flex items-start">
                          <TrendingUp className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                          <span className="text-sm font-medium text-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-auto pt-6">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-border hover:bg-muted text-base font-medium">
                    Get Started
                  </Button>
                </div>
              </motion.div>

              {/* PLAN 2 - Scale Engine (MOST POPULAR) */}
              <motion.div 
                whileHover={{ y: -8 }}
                className="flex flex-col h-full bg-card rounded-3xl p-8 border-2 border-primary shadow-xl relative transform lg:scale-105 z-10"
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide shadow-md">
                  MOST POPULAR
                </div>
                <div className="mb-6 mt-2">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Scale Engine</h3>
                  <p className="text-muted-foreground text-sm h-10">Best for growing businesses generating ₹5L–50L/month.</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold tracking-tight text-primary">₹40,000–75,000</span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>
                </div>
                
                <div className="space-y-6 mb-8 flex-grow">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">Features Included</h4>
                    <ul className="space-y-3">
                      {['Advanced lead generation funnels', 'Paid ads management', 'CRM + email automation', 'Conversion optimization', 'Monthly strategy calls'].map((f, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle2 className="w-5 h-5 text-primary mr-3 shrink-0" />
                          <span className="text-sm text-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">Expected Outcomes</h4>
                    <ul className="space-y-3">
                      {['2x–5x lead growth', 'Improved conversion rates', 'Automated follow-ups'].map((f, i) => (
                        <li key={i} className="flex items-start">
                          <TrendingUp className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                          <span className="text-sm font-medium text-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-auto pt-6">
                  <Button className="w-full h-14 rounded-xl text-base font-bold shadow-lg shadow-primary/25">
                    Get Started
                  </Button>
                </div>
              </motion.div>

              {/* PLAN 3 - AI Revenue */}
              <motion.div 
                whileHover={{ y: -8 }}
                className="flex flex-col h-full bg-[#0a0a0a] text-white rounded-3xl p-8 border border-gray-800 shadow-lg"
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">AI Revenue System</h3>
                  <p className="text-gray-400 text-sm h-10">Best for scaling businesses generating ₹50L+.</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-extrabold tracking-tight">₹1,00,000–2,00,000+</span>
                    <span className="text-gray-400 ml-2">/month</span>
                  </div>
                </div>
                
                <div className="space-y-6 mb-8 flex-grow">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Features Included</h4>
                    <ul className="space-y-3">
                      {['Full AI automation system', 'Advanced CRM + pipeline automation', 'AI chatbots + lead qualification', 'Multi-channel marketing', 'Dedicated growth manager'].map((f, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle2 className="w-5 h-5 text-accent mr-3 shrink-0" />
                          <span className="text-sm text-gray-300">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Expected Outcomes</h4>
                    <ul className="space-y-3">
                      {['Predictable revenue growth', 'Fully automated lead handling', 'Scalable systems'].map((f, i) => (
                        <li key={i} className="flex items-start">
                          <TrendingUp className="w-5 h-5 text-accent mr-3 shrink-0" />
                          <span className="text-sm font-medium text-white">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-auto pt-6">
                  <Button className="w-full h-12 rounded-xl bg-white text-black hover:bg-gray-200 text-base font-medium">
                    Get Started
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ROI JUSTIFICATION SECTION */}
        <section className="py-24 bg-muted/50 border-y border-border overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">See Your ROI</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Our systems aren't an expense. They are a profit-generating engine. Let the math speak for itself.
              </p>
            </div>

            <motion.div 
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="bg-card rounded-3xl p-8 lg:p-12 shadow-lg border border-border max-w-5xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
                {/* Connecting Lines for Desktop */}
                <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 -translate-y-1/2 z-0"></div>

                <motion.div variants={fadeIn} className="relative z-10 bg-card p-6 rounded-2xl border border-border shadow-sm hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarClock className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">Extra Clients</h4>
                  <div className="text-4xl font-extrabold text-foreground tabular-nums">
                    +<AnimatedNumber value={20} /> <span className="text-lg text-muted-foreground font-medium">/mo</span>
                  </div>
                </motion.div>

                <motion.div variants={fadeIn} className="relative z-10 bg-card p-6 rounded-2xl border border-border shadow-sm hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">Average Deal Size</h4>
                  <div className="text-4xl font-extrabold text-foreground tabular-nums">
                    <AnimatedNumber value={20000} prefix="₹" />
                  </div>
                </motion.div>

                <motion.div variants={fadeIn} className="relative z-10 bg-primary p-6 rounded-2xl shadow-lg text-white transform scale-105">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-white/80 text-sm font-medium uppercase tracking-wider mb-2">Additional Revenue</h4>
                  <div className="text-4xl md:text-5xl font-extrabold tabular-nums">
                    <AnimatedNumber value={400000} prefix="₹" />
                  </div>
                </motion.div>
              </div>

              <motion.div variants={fadeIn} className="mt-12 text-center p-6 bg-muted rounded-2xl border border-border">
                <p className="text-lg text-foreground font-medium">
                  Compare <span className="text-primary font-bold tracking-tight">₹4,00,000</span> in new revenue against a <span className="font-bold">₹40,000–75,000</span> investment. 
                  <br className="hidden sm:block"/> That's a <strong className="text-green-600">533%–1000% Return on Investment</strong> in the first month alone.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare Features</h2>
              <p className="text-muted-foreground text-lg">See exactly what you get at each growth stage.</p>
            </div>

            <div className="overflow-x-auto pb-6">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-left font-semibold text-muted-foreground w-1/4 border-b-2 border-border">Feature Breakdown</th>
                    <th className="p-4 text-center font-bold text-foreground w-1/4 border-b-2 border-border bg-card">Starter Growth<br/><span className="text-sm font-normal text-muted-foreground">₹15K–25K</span></th>
                    <th className="p-4 text-center font-bold text-primary w-1/4 border-b-2 border-primary bg-primary/5 rounded-t-xl relative">
                      Scale Engine<br/><span className="text-sm font-normal text-muted-foreground">₹40K–75K</span>
                      <div className="absolute top-0 left-0 w-full h-1 bg-primary rounded-t-xl"></div>
                    </th>
                    <th className="p-4 text-center font-bold text-foreground w-1/4 border-b-2 border-border bg-gray-50 dark:bg-gray-900/50">AI Revenue System<br/><span className="text-sm font-normal text-muted-foreground">₹1L–2L+</span></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Lead Generation', levels: ['Basic', 'Advanced Funnels', 'Multi-channel (Ads+SEO)'] },
                    { feature: 'CRM Integration', levels: ['Standard Setup', 'Full Automation', 'Custom Pipelines'] },
                    { feature: 'Automation', levels: ['Email Only', 'Email + SMS + WhatsApp', 'Omnichannel AI'] },
                    { feature: 'AI Systems', levels: ['-', 'Basic Chatbot', 'Advanced AI Agents & Scoring'] },
                    { feature: 'Dedicated Manager', levels: ['-', 'Monthly Sync', 'Weekly Sync & Strategy'] },
                    { feature: 'Custom Integrations', levels: ['-', 'Up to 3 Tools', 'Unlimited Ecosystem'] },
                    { feature: 'Priority Support', levels: ['Email Support', '24/7 Priority', 'Dedicated Slack Channel'] }
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-5 text-sm font-medium text-foreground">{row.feature}</td>
                      <td className="p-5 text-center text-sm text-muted-foreground bg-card">
                        {row.levels[0] === '-' ? <span className="text-muted-foreground/30">—</span> : row.levels[0]}
                      </td>
                      <td className="p-5 text-center text-sm font-medium text-foreground bg-primary/5">
                        {row.levels[1] === '-' ? <span className="text-muted-foreground/30">—</span> : row.levels[1]}
                      </td>
                      <td className="p-5 text-center text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900/50">
                        {row.levels[2] === '-' ? <span className="text-muted-foreground/30">—</span> : row.levels[2]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* RISK REVERSAL SECTION */}
        <section className="py-24 bg-[#0a0a0a] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose OxgenieEdge?</h2>
              <p className="text-gray-400 text-lg">We remove the risk so you can focus on growth.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {[
                { title: 'Free strategy audit', icon: Search, desc: 'Discover hidden bottlenecks before paying a dime.' },
                { title: 'No long-term contracts', icon: FileX, desc: 'We earn your business every single month.' },
                { title: 'Cancel anytime', icon: Ban, desc: 'Complete freedom. Just a standard 30-day notice.' },
                { title: 'Performance-driven', icon: TrendingUp, desc: 'Our KPIs align directly with your revenue targets.' },
                { title: 'Transparent reporting', icon: BarChart, desc: 'Live dashboards so you always know your numbers.' }
              ].map((point, idx) => (
                <div key={idx} className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(20%-20px)] bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    <point.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">{point.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{point.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CUSTOM PLAN CTA */}
        <section className="py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-muted to-background border border-border p-8 md:p-12 rounded-3xl shadow-sm text-center flex flex-col items-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Need a custom growth system?</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
                Our team can design a tailored solution for your unique business needs. Enterprise integrations, custom AI models, and specialized workflows.
              </p>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl border-2 hover:bg-muted" onClick={() => navigate('/contact')}>
                Book Strategy Call
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-24 bg-muted/30 border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground text-lg">Everything you need to know about our pricing and process.</p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {[
                { q: 'How long to see results?', a: 'Most clients see initial results within 30 days. Significant, scalable growth typically occurs within 60-90 days as algorithms learn and pipelines fill.' },
                { q: 'Do you guarantee results?', a: 'We guarantee effort and strategy. Results depend on market conditions and implementation. We focus on measurable KPIs and transparent reporting so you always know exactly what is happening.' },
                { q: 'Can I cancel anytime?', a: 'Yes. We do not believe in locking clients into long-term contracts. You can cancel anytime with a standard 30-day notice.' },
                { q: 'What industries do you work with?', a: 'We specialize in B2B services, SaaS, e-commerce, real estate, healthcare, and professional services. We have proven experience across 15+ complex industries.' },
                { q: 'Do you offer custom solutions?', a: 'Absolutely. Our AI Revenue System can be fully customized. Book a strategy call to discuss your unique technical and operational needs.' },
                { q: 'What\'s included in the strategy call?', a: 'You get a free 30-minute audit of your current systems, an analysis of immediate growth opportunities, a custom operational roadmap, and a tailored pricing recommendation.' }
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/50 transition-colors">
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-6 hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary z-0"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent z-0"></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Ready to Scale Your Business with AI?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
              Join the smart businesses that have already automated their growth. Stop leaving revenue on the table.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl bg-white text-primary hover:bg-gray-100 shadow-xl font-bold" onClick={() => navigate('/contact')}>
                Book Free Strategy Call
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl border-white/50 text-white hover:bg-white/10 hover:text-white" onClick={() => navigate('/contact')}>
                Get Started Now
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PricingPage;