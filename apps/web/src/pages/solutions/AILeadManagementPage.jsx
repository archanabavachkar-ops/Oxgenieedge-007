
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Target, Filter, Zap, ArrowRight, Users, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const AILeadManagementPage = () => {
  return (
    <>
      <Helmet>
        <title>AI Lead Management | Solutions | OxgenieEdge</title>
        <meta name="description" content="Automated lead capture, scoring, and routing powered by AI." />
      </Helmet>
      <Header />
      
      <main className="bg-[#0a0a0a] min-h-screen text-white">
        {/* Hero Section */}
        <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
                Never let a high-value lead <span className="text-primary">slip through the cracks</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 text-balance">
                Intelligent capture, predictive scoring, and instant routing. Convert prospects into customers faster with an AI-driven pipeline.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all active:scale-[0.98]">
                  Optimize Your Pipeline
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Zig-Zag Features */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
            
            {/* Feature 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 md:order-1"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Omnichannel Capture</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Automatically aggregate leads from your website, social media, email campaigns, and third-party integrations into a single, unified dashboard. No manual entry required.
                </p>
                <ul className="space-y-3">
                  {['Real-time synchronization', 'Duplicate detection & merging', 'Source attribution tracking'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 md:order-2 bg-card border border-border/50 rounded-3xl aspect-square md:aspect-[4/3] flex items-center justify-center p-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                <Users className="w-32 h-32 text-muted-foreground/20" />
              </motion.div>
            </div>

            {/* Feature 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-card border border-border/50 rounded-3xl aspect-square md:aspect-[4/3] flex items-center justify-center p-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 to-transparent"></div>
                <Filter className="w-32 h-32 text-muted-foreground/20" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Predictive Lead Scoring</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Our AI analyzes dozens of data points to score leads instantly. Focus your sales team's energy on prospects with the highest probability of conversion.
                </p>
                <ul className="space-y-3">
                  {['Behavioral analysis', 'Firmographic enrichment', 'Dynamic score adjustments'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary/5 border-t border-primary/10">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Stop guessing. Start closing.</h2>
            <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all">
              Request a Demo
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AILeadManagementPage;
