
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Bot, BrainCircuit, Zap, LineChart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const AIChiefOfStaffPage = () => {
  return (
    <>
      <Helmet>
        <title>AI Chief of Staff | Solutions | OxgenieEdge</title>
        <meta name="description" content="Automate decisions and operations with your AI Chief of Staff." />
      </Helmet>
      <Header />
      
      <main className="bg-[#0a0a0a] min-h-screen text-white">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                <Bot className="w-4 h-4" />
                <span>Next-Generation AI</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
                Your AI Chief of Staff for <span className="text-primary">Strategic Growth</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-8 text-balance">
                Delegate operational overhead, automate complex decision-making, and focus on what truly matters. An intelligent partner that works 24/7 to scale your business.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all active:scale-[0.98]">
                  Deploy Your AI
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link to="/pricing" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-all active:scale-[0.98]">
                  View Pricing
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Capabilities that redefine productivity</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">Everything you need to put your operations on autopilot.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Large Feature */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="md:col-span-2 bg-card rounded-3xl p-8 border border-border/50 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
                <BrainCircuit className="w-12 h-12 text-primary mb-6 relative z-10" />
                <h3 className="text-2xl font-bold mb-3 relative z-10">Cognitive Task Automation</h3>
                <p className="text-muted-foreground leading-relaxed max-w-md relative z-10">
                  Beyond simple rules. The AI understands context, analyzes historical data, and executes multi-step workflows across your entire tool stack without human intervention.
                </p>
              </motion.div>

              {/* Small Feature 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-3xl p-8 border border-border/50"
              >
                <Zap className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-xl font-bold mb-3">Instant Execution</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Zero latency between decision and action. Processes that took days now happen in milliseconds.
                </p>
              </motion.div>

              {/* Small Feature 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-3xl p-8 border border-border/50"
              >
                <LineChart className="w-10 h-10 text-primary mb-6" />
                <h3 className="text-xl font-bold mb-3">Predictive Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Forecast trends, identify bottlenecks, and receive proactive recommendations before issues arise.
                </p>
              </motion.div>

              {/* Medium Feature */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="md:col-span-2 bg-card rounded-3xl p-8 border border-border/50 flex flex-col justify-center"
              >
                <h3 className="text-2xl font-bold mb-6">Seamless Integration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Native CRM Sync', 'Email & Calendar Management', 'Financial Reporting', 'Team Communication'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Ready to hire your AI executive?</h2>
            <p className="text-xl text-muted-foreground mb-10">Join forward-thinking companies scaling faster with intelligent automation.</p>
            <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/25">
              Get Started Today
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AIChiefOfStaffPage;
