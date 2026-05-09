
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Users, DollarSign, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const PartnerPortalPage = () => {
  return (
    <>
      <Helmet>
        <title>Partner Portal | Platform | OxgenieEdge</title>
        <meta name="description" content="Collaborate and grow your business with our Partner Portal." />
      </Helmet>
      <Header />
      
      <main className="bg-[#0a0a0a] min-h-screen text-white">
        {/* Hero */}
        <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
                  Grow together with the <span className="text-primary">Partner Portal</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                  A dedicated environment for affiliates, resellers, and agency partners to track referrals, manage commissions, and access enablement resources.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/partner-application" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all active:scale-[0.98]">
                    Apply to Partner
                  </Link>
                  <Link to="/partners/login" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-all active:scale-[0.98]">
                    Partner Login
                  </Link>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-card border border-border/50 rounded-3xl aspect-video flex items-center justify-center relative overflow-hidden"
              >
                <Users className="w-24 h-24 text-muted-foreground/20" />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Numbered List Features */}
        <section className="py-24 bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-16 text-center">Everything you need to succeed</h2>
            
            <div className="space-y-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex gap-6"
              >
                <div className="text-5xl font-bold text-primary/20 shrink-0">01</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Real-time Tracking
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Monitor your referral links, track lead statuses, and watch your pipeline grow in real-time. Full transparency into every deal you bring in.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex gap-6"
              >
                <div className="text-5xl font-bold text-primary/20 shrink-0">02</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" /> Automated Commissions
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Say goodbye to manual invoicing. Commissions are calculated automatically based on your tier and paid out on a reliable schedule.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex gap-6"
              >
                <div className="text-5xl font-bold text-primary/20 shrink-0">03</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" /> Co-branded Resources
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Access a library of marketing materials, pitch decks, and case studies that you can easily co-brand to help close deals faster.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default PartnerPortalPage;
