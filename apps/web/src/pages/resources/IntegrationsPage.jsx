
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Puzzle, ArrowRight, Mail, MessageSquare, CreditCard, Database, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const IntegrationsPage = () => {
  const integrations = [
    { name: 'WhatsApp Business', icon: MessageSquare, desc: 'Automate messaging and support via WhatsApp API.', category: 'Communication' },
    { name: 'Facebook Lead Ads', icon: Globe, desc: 'Sync leads instantly from your social campaigns.', category: 'Marketing' },
    { name: 'Stripe & Razorpay', icon: CreditCard, desc: 'Process payments securely within the platform.', category: 'Finance' },
    { name: 'Email Providers', icon: Mail, desc: 'Connect SMTP or API for automated email sequences.', category: 'Communication' },
    { name: 'Custom Webhooks', icon: Puzzle, desc: 'Push and pull data to any external system.', category: 'Developer' },
    { name: 'External CRMs', icon: Database, desc: 'Two-way sync with legacy systems if needed.', category: 'Data' },
  ];

  return (
    <>
      <Helmet>
        <title>Integrations | Resources | OxgenieEdge</title>
        <meta name="description" content="Connect OxgenieEdge with your favorite tools." />
      </Helmet>
      <Header />
      
      <main className="bg-[#0a0a0a] min-h-screen text-white">
        {/* Hero */}
        <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6">
                Connect your <span className="text-primary">entire stack</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 text-balance">
                OxgenieEdge plays nicely with the tools you already use. Seamlessly sync data, trigger automations, and unify your workflows.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Integrations Grid */}
        <section className="py-20 bg-slate-950 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                  <p className="text-muted-foreground mb-6">{item.desc}</p>
                  <Link to="/contact" className="text-sm font-medium text-primary hover:underline inline-flex items-center">
                    View Documentation <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">Need a custom integration?</h2>
            <p className="text-muted-foreground mb-8">Our API and webhook infrastructure allows you to build custom connections to any proprietary system.</p>
            <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-secondary text-secondary-foreground font-bold hover:bg-secondary/80 transition-all">
              Talk to our API team
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default IntegrationsPage;
