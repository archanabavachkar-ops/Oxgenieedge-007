import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Menu, 
  PhoneCall, 
  Target, 
  Zap, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  Layers,
  MessageSquare,
  MousePointerClick,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const IndustriesPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const industries = [
    {
      name: "Real Estate",
      image: "https://images.unsplash.com/photo-1566770513587-c0667d61f6f9",
      problem: "Low-quality leads. Delayed follow-ups. High ad spend wastage.",
      solution: "AI-powered real estate funnels with automated lead qualification, WhatsApp + CRM follow-ups, high-converting property landing pages.",
      results: ["2–4x higher lead conversion", "Faster deal closures", "Reduced cost per lead"],
      cta: "Get Real Estate Growth System"
    },
    {
      name: "Healthcare & Clinics",
      image: "https://images.unsplash.com/photo-1675270714610-11a5cadcc7b3",
      problem: "Missed appointments. High patient acquisition cost. Manual coordination.",
      solution: "AI appointment scheduling, Automated reminders (WhatsApp/SMS), Local SEO + paid ads for patient acquisition.",
      results: ["40–60% increase in appointments", "Reduced no-shows", "Better patient retention"],
      cta: "Get Healthcare Growth Plan"
    },
    {
      name: "E-Commerce",
      image: "https://images.unsplash.com/photo-1677693944335-178ba4f745d2",
      problem: "High cart abandonment. Low ROI on ads. Poor retention.",
      solution: "Conversion-optimized funnels, Abandoned cart automation, Performance marketing + AI retargeting.",
      results: ["Increased conversion rate", "Higher customer lifetime value", "Better ROAS"],
      cta: "Scale My Store"
    },
    {
      name: "Education & Coaching",
      image: "https://images.unsplash.com/photo-1679316481049-4f6549df499f",
      problem: "Low enrollments. Poor lead nurturing. Manual sales process.",
      solution: "Webinar funnels, Automated lead nurturing, CRM + enrollment tracking.",
      results: ["Higher student conversions", "Scalable enrollment systems", "Reduced manual effort"],
      cta: "Grow My Institute"
    },
    {
      name: "Local Businesses",
      image: "https://images.unsplash.com/photo-1673887910299-65155a769eab",
      problem: "No consistent leads. Poor online presence. Missed inquiries.",
      solution: "Google Ads + Local SEO, WhatsApp booking automation, Lead tracking CRM.",
      results: ["More daily inquiries", "Increased walk-ins/bookings", "Better customer engagement"],
      cta: "Get More Local Leads"
    },
    {
      name: "Startups & SaaS",
      image: "https://images.unsplash.com/photo-1538688554366-621d446302aa",
      problem: "Unclear growth strategy. Poor user acquisition. Low conversions.",
      solution: "Growth funnels + landing pages, Product demo automation, Performance marketing.",
      results: ["Faster user acquisition", "Higher activation rates", "Scalable growth systems"],
      cta: "Scale My Startup"
    },
    {
      name: "Finance & Insurance",
      image: "https://images.unsplash.com/photo-1641790016911-0353099329f6",
      problem: "Low trust, poor lead quality, long conversion cycles.",
      solution: "Lead qualification funnels, Automated nurturing systems, High-trust landing pages.",
      results: ["Better lead quality", "Faster conversions", "Improved client trust"],
      cta: "Get High-Quality Leads"
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary">
      <Helmet>
        <title>Industry-Specific AI Growth Solutions | OxgenieEdge</title>
        <meta name="description" content="We design industry-specific AI, automation, and marketing systems that solve real business problems and drive measurable growth." />
        <meta name="keywords" content="AI automation, industry-specific solutions, lead generation, growth systems" />
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

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`text-sm font-medium hover:text-primary transition-colors ${isScrolled ? 'text-muted-foreground' : 'text-white/80'}`}>Home</Link>
            <Link to="/industries" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-primary' : 'text-white'}`}>Industries</Link>
            <Link to="/pricing" className={`text-sm font-medium hover:text-primary transition-colors ${isScrolled ? 'text-muted-foreground' : 'text-white/80'}`}>Pricing</Link>
            <Link to="/contact" className={`text-sm font-medium hover:text-primary transition-colors ${isScrolled ? 'text-muted-foreground' : 'text-white/80'}`}>Contact</Link>
            <Button className="rounded-full shadow-lg hover:shadow-xl transition-all" size="sm" onClick={() => navigate('/contact')}>
              <PhoneCall className="w-4 h-4 mr-2" />
              Get Free Strategy Call
            </Button>
          </nav>

          <button 
            className={`md:hidden p-2 rounded-md ${isScrolled ? 'text-foreground' : 'text-white'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden glass-effect border-t mt-3 absolute w-full"
          >
            <div className="flex flex-col px-4 py-6 space-y-4">
              <Link to="/" className="text-foreground font-medium p-2 hover:bg-muted rounded-md">Home</Link>
              <Link to="/industries" className="text-primary font-medium p-2 bg-primary/5 rounded-md">Industries</Link>
              <Link to="/pricing" className="text-foreground font-medium p-2 hover:bg-muted rounded-md">Pricing</Link>
              <Link to="/contact" className="text-foreground font-medium p-2 hover:bg-muted rounded-md">Contact</Link>
              <Button className="w-full justify-center mt-4" onClick={() => navigate('/contact')}>Get Free Strategy Call</Button>
            </div>
          </motion.div>
        )}
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-dark-surface">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1678995635432-d9e89c7a8fc5" 
              alt="AI Technology and Business Growth" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-background"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-32 pb-20">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight"
            >
              AI-Powered Growth Systems <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Built for Your Industry</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              We don't offer generic services. We design industry-specific AI, automation, and marketing systems that solve real business problems and drive measurable growth.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl shadow-lg shadow-primary/20 group" onClick={() => navigate('/contact')}>
                Explore Your Industry Solution
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/contact')}
                className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                Get Free Growth Plan
              </Button>
            </motion.div>
          </div>
        </section>

        {/* WHO THIS IS FOR SECTION */}
        <section className="py-24 bg-background relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Scale</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Whether you're a startup, local business, or enterprise — our systems are built to:
              </p>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                { icon: Target, title: "Generate high-quality leads" },
                { icon: Zap, title: "Automate follow-ups & conversions" },
                { icon: Clock, title: "Reduce manual workload" },
                { icon: TrendingUp, title: "Scale revenue predictably" }
              ].map((item, idx) => (
                <motion.div key={idx} variants={fadeIn} className="bg-card p-8 rounded-2xl border border-border hover-lift text-center flex flex-col items-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* INDUSTRIES SECTION */}
        <section className="py-24 bg-muted/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Industry Solutions</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Tailored growth engines designed for the unique challenges of your market.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {industries.map((industry, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-card rounded-3xl overflow-hidden border border-border hover-lift flex flex-col ${idx === 6 ? 'lg:col-span-3 lg:flex-row' : ''}`}
                >
                  <div className={`relative ${idx === 6 ? 'lg:w-2/5' : 'h-48'}`}>
                    <img src={industry.image} alt={industry.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                      <h3 className="text-2xl font-bold text-white">{industry.name}</h3>
                    </div>
                  </div>
                  
                  <div className={`p-6 flex flex-col flex-grow ${idx === 6 ? 'lg:w-3/5 lg:p-8' : ''}`}>
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-destructive uppercase tracking-wider mb-1">The Problem</h4>
                      <p className="text-muted-foreground text-sm">{industry.problem}</p>
                    </div>
                    
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-primary uppercase tracking-wider mb-1">Our Solution</h4>
                      <p className="text-foreground text-sm font-medium">{industry.solution}</p>
                    </div>
                    
                    <div className="mb-8 flex-grow">
                      <h4 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-2">Expected Results</h4>
                      <ul className="space-y-2">
                        {industry.results.map((res, i) => (
                          <li key={i} className="flex items-start text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                            {res}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button className="w-full mt-auto" onClick={() => navigate('/contact')}>
                      {industry.cta}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTIONS ACROSS INDUSTRIES */}
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Solutions Across Industries</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                No matter your industry, we build:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
              {[
                { icon: Target, text: "AI-powered lead generation systems" },
                { icon: Layers, text: "Automated CRM & follow-ups" },
                { icon: MousePointerClick, text: "Conversion-optimized websites" },
                { icon: BarChart3, text: "Performance marketing campaigns" },
                { icon: MessageSquare, text: "WhatsApp & chatbot automation" }
              ].map((item, idx) => (
                <div key={idx} className="bg-muted/50 p-6 rounded-2xl text-center flex flex-col items-center border border-border">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium text-sm text-foreground">{item.text}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <p className="inline-block bg-primary/10 text-primary font-semibold px-6 py-3 rounded-full">
                Everything is integrated into one growth engine
              </p>
            </div>
          </div>
        </section>

        {/* RESULTS & IMPACT SECTION */}
        <section className="py-24 bg-[#1F2937] text-white bg-dark-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Results & Impact</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Businesses using our systems have achieved:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { metric: "2x–5x", desc: "increase in qualified leads" },
                { metric: "30–60%", desc: "improvement in conversion rates" },
                { metric: "40%", desc: "reduction in manual workload" },
                { metric: "Faster", desc: "ROI from marketing spend" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center hover:bg-white/10 transition-colors">
                  <div className="text-4xl md:text-5xl font-extrabold text-primary mb-4">{stat.metric}</div>
                  <p className="text-gray-300 font-medium">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-24 relative overflow-hidden bg-primary text-white bg-dark-surface">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent z-0"></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to Build Your Growth System?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto font-medium">
              Stop relying on random marketing tactics. Start using a predictable, automated growth system tailored to your industry.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl bg-white text-primary hover:bg-gray-100 shadow-xl font-bold" onClick={() => navigate('/contact')}>
                Get Free Strategy Call
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl border-white/50 text-white hover:bg-white/10 hover:text-white" onClick={() => navigate('/pricing')}>
                View Pricing Plans
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default IndustriesPage;